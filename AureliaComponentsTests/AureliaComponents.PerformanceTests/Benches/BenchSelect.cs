namespace AureliaComponents.PerformanceTests.Benches
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;
    using System;

    public class BenchSelect :BaseBench, IBench
    {
        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("run")));
            element.Click();
            for (int i = 0; i < WARMUP_COUNT; i++)
            {
                element = wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//tbody/tr[" + (i + 1) + "]/td[2]/a")));
                element.Click();
            }
        }

        public void Run(IWebDriver driver)
        {
            IWebElement element = driver.FindElement(By.XPath("//tbody/tr[1]/td[2]/a"));
            element.Click();
        }

        public String GetName()
        {
            return "select row";
        }
    }
}
