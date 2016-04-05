namespace AureliaComponents.PerformanceTests.Benches
{
    using System;

    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;

    public class GridBenchRun : BaseBench, IBench
    {
        public By Locator { get { return By.CssSelector("*[click\\.trigger=\"toggleShowGrid()\"]"); } }

        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(this.Locator));
        }

        public void Run(IWebDriver driver)
        {
            IWebElement element = driver.FindElement(this.Locator);
            element.Click();
        }

        public string Name
        {
            get 
            { 
                return "create 1000 in the grid"; 
            }
        }
    }
}
