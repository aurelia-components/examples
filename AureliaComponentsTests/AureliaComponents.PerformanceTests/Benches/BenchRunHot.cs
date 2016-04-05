namespace AureliaComponents.PerformanceTests.Benches
{
    using System;

    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;

    public class BenchRunHot : BaseBench, IBench
    {
        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("run")));
            for (int i = 0; i < WARMUP_COUNT; i++)
            {
                driver.FindElement(By.Id("run")).Click();
                element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("run")));
            }
        }

        public void Run(IWebDriver driver)
        {
            IWebElement element = driver.FindElement(By.Id("run"));
            element.Click();
        }

        public string Name
        {
            get { return "update 1000 rows (hot)"; }
        }
    }
}
