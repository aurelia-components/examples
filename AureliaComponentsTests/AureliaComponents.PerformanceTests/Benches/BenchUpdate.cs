namespace AureliaComponents.PerformanceTests.Benches
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;
    using System;

    public class BenchUpdate : BaseBench, IBench
    {
        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("run")));
            element.Click();
            for (int i = 0; i < WARMUP_COUNT; i++)
            {
                driver.FindElement(By.Id("update")).Click();
                element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("update")));
            }
        }

        public void Run(IWebDriver driver)
        {
            driver.FindElement(By.Id("update")).Click();
        }

        public String GetName()
        {
            return "partial update";
        }
    }
}
