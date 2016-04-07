namespace AureliaComponents.PerformanceTests
{
    using System.Collections.Generic;
    using System.Linq;

    using AureliaComponents.PerformanceTests.Benches;

    public class ChartCreator
    {
        public string CreateChartData(int idx, string framework, IBench[] benches, Dictionary<string, double> results)
        {
            int[] colors = new int[] { 0x00AAA0, 0x8ED2C9, 0x44B3C2, 0xF1A94E, 0xE45641, 0x7CE8BF, 0x5D4C46, 0x7B8D8E, 0xA9FFB7, 0xF4D00C, 0x462066 };
            int r = (colors[idx % colors.Length] >> 16) & 0xff;
            int g = (colors[idx % colors.Length] >> 8) & 0xff;
            int b = (colors[idx % colors.Length]) & 0xff;

            string data = "'" + string.Join("','", benches.Select(bench => results[bench.Name].ToString())) + "'";
            return "{"
                    + "label: '" + framework + "',"
                    + "fillColor: 'rgba(" + r + ", " + g + " ," + b + ", 0.5)',"
                    + "strokeColor: 'rgba(" + r + ", " + g + " ," + b + ", 0.8)',"
                    + "highlightFill: 'rgba(" + r + ", " + g + " , " + b + ", 0.7)',"
                    + "highlightStroke: 'rgba(" + r + ", " + g + " ," + b + ", 0.9)',"
                    + "data: [" + data + "]"
            + "}";
        }
    }
}
