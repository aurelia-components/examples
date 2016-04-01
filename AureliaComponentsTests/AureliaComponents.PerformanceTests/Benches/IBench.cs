namespace AureliaComponents.PerformanceTests.Benches
{
    using OpenQA.Selenium;

    public interface IBench
    {
        void Init(IWebDriver driver);
        void Run(IWebDriver driver);
        string GetName();
    }
}
