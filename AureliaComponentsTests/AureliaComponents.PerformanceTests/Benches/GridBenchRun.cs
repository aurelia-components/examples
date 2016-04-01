using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AureliaComponents.PerformanceTests.Benches
{
    public class GridBenchRun : BaseBench, IBench
    {
        private By locator = By.CssSelector("*[click\\.trigger=\"addItem()\"]");

        public void Init(IWebDriver driver)
        {
            driver.Navigate().GoToUrl(DefaultUri);
            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            IWebElement element = wait.Until(ExpectedConditions.ElementToBeClickable(locator));
        }

        public void Run(IWebDriver driver)
        {
            IWebElement element = driver.FindElement(locator);
            element.Click();
        }

        public string GetName()
        {
            return "create 1000 in the grid";
        }
    }
}
