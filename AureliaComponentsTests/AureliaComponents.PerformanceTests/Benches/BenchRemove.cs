namespace AureliaComponents.PerformanceTests.Benches
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    public class BenchRemove : BaseBench, IBench
    {
        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(By.Id("run")));
            element.Click();
            for (int i = 3 + WARMUP_COUNT; i >= 3; i--)
            {
                element = wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//tbody/tr[" + i + "]/td[3]/a")));
                element.Click();
            }
        }

        public void Run(IWebDriver driver)
        {
            IWebElement element = driver.FindElement(By.XPath("//tbody/tr[1]/td[3]/a"));
            element.Click();
        }

        public String GetName()
        {
            return "remove row";
        }
    }
}
