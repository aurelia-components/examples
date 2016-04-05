namespace AureliaComponents.PerformanceTests.Benches
{
    using System;

    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;

    public class BenchRun : BaseBench, IBench
    {
        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("run")));
        }

        public void Run(IWebDriver driver)
        {
            IWebElement element = driver.FindElement(By.Id("run"));
            element.Click();
        }

        public string Name
        {
            get { return "create 1000 rows"; } 
        }
    }
}
