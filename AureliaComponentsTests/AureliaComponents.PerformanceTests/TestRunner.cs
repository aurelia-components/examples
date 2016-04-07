﻿namespace AureliaComponents.PerformanceTests
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Text;
    using System.Threading;

    using Newtonsoft.Json.Linq;
    using OpenQA.Selenium;
    using OpenQA.Selenium.Chrome;
    using OpenQA.Selenium.Support.UI;

    using AureliaComponents.PerformanceTests.Benches;

    public class TestRunner
    {
        private const int REPEAT_RUN = 4;
        private const int DROP_WORST_COUNT = 2;
        private readonly static IBench[] benches =
            new IBench[] { 
            //new GridBenchRun(), 
            new BenchRun(),
            //new BenchRunHot(), 
            //new BenchUpdate(), 
            //new BenchSelect(), 
            //new BenchRemove() 
            };
        private ChromeDriverFactory factory;
        private ChartCreator chartDataCreator;

        public TestRunner(ChromeDriverFactory factory, ChartCreator chartDataCreator)
        {
            this.factory = factory;
            this.chartDataCreator = chartDataCreator;
        }

        public void RunTests()
        {
            Dictionary<string, double> results = new Dictionary<string, double>();

            foreach (var bench in benches)
            {
                Console.WriteLine(bench.Name);                
                ChromeDriver driver = this.factory.GetDriver();

                try
                {
                    double[] data = new double[REPEAT_RUN];
                    double lastWait = 1000;
                    for (int i = 0; i < REPEAT_RUN; i++)
                    {
                        Console.WriteLine(bench.Name + " => init");
                        bench.Init(driver);

                        WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));

                        Thread.Sleep(2000);
                        //PrintLog(driver, false, true);
                        Console.WriteLine(bench.Name + " => run");
                        bench.Run(driver);
                        Console.WriteLine("run " + bench.Name);

                        var loc = By.Id("run");

                        if (bench is GridBenchRun)
                        {
                            loc = (bench as GridBenchRun).Locator;
                        }
                       
                        var element = wait.Until(ExpectedConditions.ElementToBeClickable(loc));
                        
                        Thread.Sleep(1000 + (int)lastWait);

                        Console.Write(i + 1 + ". ");

                        double? res = 0;
                        try
                        {
                            res = PrintLog(driver, true, true);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("BOOM! ----> " + ex.Message);
                            i--;
                            continue;
                        }
                        
                        if (res != null)
                        {
                            data[i] = res.Value;
                            lastWait = data[i];
                        }
                    }
                    //Console.WriteLine("before " + string.Join(", ", data));
                    if (DROP_WORST_COUNT > 0)
                    {
                        Array.Sort(data);
                        double[] arr = new double[data.Length - DROP_WORST_COUNT];
                        Array.Copy(data, arr, data.Length - DROP_WORST_COUNT);
                        data = arr;

                        //Console.WriteLine("after " + string.Join(", ", data));
                    }
                    results.Add(bench.Name, data.Average());
                }
                finally
                {
                    driver.Quit();
                }
            }
            string labels = "'" + string.Join("','", benches.Select(bench => bench.Name.ToString())) + "'";
            StringBuilder str = new StringBuilder("var data = { labels : [" + labels + "], datasets: [");

            var chartData = this.chartDataCreator.CreateChartData(0, "aurelia", benches, results);
            str.Append(chartData);
            string fin = str + "]};";
            File.WriteAllText("../../chartData.js", fin);

            foreach (var b in benches)
            {
                Console.WriteLine(b.Name + ":");
                Console.WriteLine(results[b.Name]);
            }
        }        

        private double? PrintLog(IWebDriver driver, bool print, bool isAurelia)
        {
            IEnumerable<LogEntry> entries = driver.Manage().Logs.GetLog(LogType.Browser);
            //Console.WriteLine(entries.Count() + " " + LogType.Browser + " log entries found");
            //foreach (LogEntry entry in entries)
            //{
            //    if (print) Console.WriteLine(
            //            entry.Timestamp + " " + entry + " " + entry.Message);
            //}

            ILogs logs = driver.Manage().Logs;
            //if (print) Console.WriteLine("Log types: " + logs.AvailableLogTypes);
            List<PLogEntry> filteredLogs = SubmitPerformanceResult(logs.GetLog("performance").ToList(), false);

            // Chrome 49 reports a Paint very short after the Event Dispatch which I can't find in the timeline
            //   it also seems to have a performance regression that can be seen in the timeline
            //   we're using the last paint event to fix measurement
            var evts = filteredLogs.Where(pe => "EventDispatch".Equals(pe.Name));
            var evt = evts.FirstOrDefault();

            long tsEvent = evt == null ? 0 : (evt.Timestamp + evt.Duration);
            // First TimerFire
            PLogEntry evtTimer = filteredLogs.Where(pe => "TimerFire".Equals(pe.Name) && pe.Timestamp > tsEvent).FirstOrDefault();

            long tsEventFire = evtTimer == null ? 0 : (evtTimer.Timestamp + evtTimer.Duration);
            // First Paint after TimerFire only for Aurelia
            //long tsAfter = isAurelia ? tsEventFire : tsEvent;
            PLogEntry lastPaint = filteredLogs
                .Where(pe => "Paint".Equals(pe.Name))
                .Last();

            //if (print) Console.WriteLine("************************ filtered events");
            //if (print) filtered.ForEach(e => Console.WriteLine(e));
            if (evt != null && lastPaint != null)
            {
                Console.ForegroundColor = ConsoleColor.Green;
                if (print) Console.WriteLine("Duration " + (lastPaint.Timestamp + lastPaint.Duration - evt.Timestamp) / 1000.0);
                Console.ResetColor();
                return (lastPaint.Timestamp + lastPaint.Duration - evt.Timestamp) / 1000.0;
            }
            return null;

        }

        private List<PLogEntry> SubmitPerformanceResult(List<LogEntry> perfLogEntries, bool print)
        {
            List<PLogEntry> filtered = new List<PLogEntry>();

            if (print) Console.WriteLine(perfLogEntries.Count + " performance log entries found");
            foreach (LogEntry entry in perfLogEntries)
            {
                var obj = JObject.Parse(entry.Message);

                if (string.IsNullOrEmpty(GetAsString(obj, "message.params.args")))
                {

                }

                string name = GetAsString(obj, "message.params.name");

                if (print) Console.WriteLine(entry.Message);
                if ("EventDispatch".Equals(name)
                        && "click".Equals(GetAsString(obj, "message.params.args.data.type"))
                    || "Paint".Equals(name)
                        || "TimerFire".Equals(name))
                {
                    filtered.Add(new PLogEntry(name,
                            (long)GetAsLong(obj, "message.params.ts"),
                            (long)GetAsLong(obj, "message.params.dur"),
                            entry.Message));
                }
            }

            return filtered;
        }

        private string GetAsString(JObject root, string path)
        {
            return GetAsStringRec(root, path.Split('.').ToList());
        }

        private double GetAsLong(JObject root, string path)
        {
            double? r = GetAsLongRec(root, path.Split('.').ToList());
            if (r == null)
            {
                return 0;
            }
            else
            {
                return r.Value;
            }
        }


        private string GetAsStringRec(JObject root, List<string> path)
        {
            JObject obj = root;
            if (root[path[0]] == null)
            {
                return null;
            }

            if (path.Count == 1)
            {
                return root[path[0]].ToString();
            }
            else
            {
                JObject jo = JObject.Parse(root[path[0]].ToString());
                return GetAsStringRec(jo, path.GetRange(1, path.Count - 1));
            }
        }

        private double? GetAsLongRec(JObject root, List<string> path)
        {
            JObject obj = root;
            if (root[path[0]] == null)
            {
                return null;
            }

            if (path.Count == 1)
            {
                return double.Parse(root[path[0]].ToString());
            }
            else
            {
                JObject jo = JObject.Parse(root[path[0]].ToString());
                return GetAsLongRec(jo, path.GetRange(1, path.Count - 1));
            }
        }
    }
}