namespace AureliaComponents.PageObjects
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading;

    using OpenQA.Selenium;
    using OpenQA.Selenium.Chrome;
    using OpenQA.Selenium.Support.UI;
    using OpenQA.Selenium.Interactions;

    public class SkeletonPageObject
    {
        private const string DefaultUrl = "http://localhost:9000/";
        protected const int DefaultRouterWatingTimeInSeconds = 10;
        protected const int DefaultVisualDelayInMiliseconds = 200;

        private readonly string routePrefix;
        protected readonly IWebDriver driver;

        public SkeletonPageObject(string driverPath, string routePrefix)
        {
            this.driver = new ChromeDriver(driverPath);
            this.routePrefix = routePrefix;
            var href = string.IsNullOrEmpty(routePrefix) ? string.Empty : routePrefix + string.Empty;
            this.driver.Navigate().GoToUrl(DefaultUrl + href);
            this.driver.Manage().Window.Maximize();
            this.WaitForElement("nav");
        }

        public void NavigateTo(string href = "")
        {
            href = string.IsNullOrEmpty(this.routePrefix) ? href : this.routePrefix + href;
            this.driver.Navigate().GoToUrl(DefaultUrl + href);
            this.WaitForElement(".nav-tabs");
        }

        public void Quit()
        {
            this.driver.Quit();
        }

        public string GetPageTitle
        {
            get
            {
                return this.driver.Title;
            }
        }

        public void Trigger(string eventName, string handler)
        {

            var items = this.driver.GetElementsByEventNameAndHandler(eventName, handler);

            foreach (var item in items)
            {
                item.Click();
                this.SetVisualDelay(DefaultVisualDelayInMiliseconds);
            }
        }

        public void ChangeSelectMenu(string optionText)
        {
            this.driver.FindElement(By.CssSelector("select")).GetElementsContainingText("option", optionText).First().Click();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds * 5);
        }

        public void SetVisualDelay(int miliseconds)
        {
            Thread.Sleep(miliseconds);
        }

        public void MoveToElement(string selector)
        {
            Actions action = new Actions(this.driver);
            var element = this.driver.FindElement(By.CssSelector(selector));
            action.MoveToElement(element).Perform();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds);
        }

        public void DragAndDrop(string selector, int x, int y)
        {
            Actions action = new Actions(this.driver);
            var element = this.driver.FindElement(By.CssSelector(selector));
            action.ClickAndHold(element).MoveByOffset(x, y).Release().Build().Perform();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds);
        }

        public void WaitForElement(string selector)
        {
            this.driver.FindElement(By.CssSelector(selector), DefaultRouterWatingTimeInSeconds);
        }
    }
}
