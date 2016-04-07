namespace AureliaComponents.PerformanceTests
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Chrome;

    public class ChromeDriverFactory
    {
        public ChromeDriver GetDriver()
        {
            ChromeOptions opts = new ChromeOptions();
            ChromePerformanceLoggingPreferences prefs = new ChromePerformanceLoggingPreferences();
            prefs.AddTracingCategories(new[] { "browser", "devtools.timeline", "devtools" });
            opts.PerformanceLoggingPreferences = prefs;
            opts.SetLoggingPreference("performance", LogLevel.All);
            ChromeDriver driver = new ChromeDriver("../../", opts);

            return driver;
        }
    }
}
