namespace AureliaComponents.PageObjects
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;

    public static class Extensions
    {
        public static IWebElement FindElement(this IWebDriver driver, By by, int timeoutInSeconds)
        {
            if (timeoutInSeconds > 0)
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutInSeconds));
                return wait.Until(drv => drv.FindElement(by));
            }
            return driver.FindElement(by);
        }

        public static IEnumerable<IWebElement> GetElementsByEventNameAndHandler(this ISearchContext driverOrElement, string eventName, string handler)
        {
            var types = new [] { "delegate", "call", "trigger"};
            foreach (var type in types)
	        {
                var elems = driverOrElement.FindElements(By.CssSelector(string.Format("*[{0}\\.{1}=\"{2}\"]", eventName, type, handler)));
                if (elems.Count > 0)
                {
                    return elems;
                }
	        }

            return null;
        }

        public static IEnumerable<IWebElement> GetElementsByPropertyBind(this ISearchContext driverOrElement, string property, string bindingModel)
        {
            return driverOrElement.FindElements(By.CssSelector(string.Format("*[{0}\\.bind=\"{1}\"]", property, bindingModel)));
        }

        public static IEnumerable<IWebElement> GetElementsContainingText(this ISearchContext driverOrElement, string selector, string text)
        {
            return driverOrElement.FindElements(By.CssSelector(selector)).Where(e => e.Text.Contains(text));
        }


    }
}
