﻿namespace AureliaComponents.PerformanceTests
{
    public class Program
    {
        public static void Main()
        {
            TestRunner app = new TestRunner(new ChromeDriverFactory());
            app.RunTests();
        }
    }
}
