namespace AureliaComponents.PageObjects
{
    using System;
    using System.Linq;

    using OpenQA.Selenium;

    public class PopoverPageObject : SkeletonPageObject
    {
        public PopoverPageObject(string driverPath)
            : base(driverPath, "#/test-popover/")
        {

        }

        public void HoverPopover(string selector)
        {
            this.MoveToElement(selector);
        }

        public bool IsPopoverDisplayed()
        {
            try
            {
                return this.driver.FindElement(By.CssSelector(".popover")).Displayed;
            }
            catch (NoSuchElementException ex)
            {
                return false;
            }
        }

        public void ChangePopoverContent(string text)
        {
            var elem = this.driver.GetElementsByPropertyBind("value", "popoverTestBinding").First();
            elem.Clear();

            if (!string.IsNullOrEmpty(text))
            {
                elem.SendKeys(text);
            }
        }

        public string GetPopoverContent()
        {
            return this.driver.FindElement(By.CssSelector(".popover-content")).Text;
        }

        public string GetPopoverTitle()
        {
            return this.driver.FindElement(By.CssSelector(".popover-title")).Text;
        }

        public void ChangePopoverTitle(string option)
        {
            this.ChangeSelect3Option("popoverTitle", option);
        }

        public void ChangePopoverPosition(string option)
        {
            this.ChangeSelect3Option("placement", option);
        }

        public void ChangePopoverTriggerType(string option)
        {
            this.ChangeSelect3Option("trigger", option);
        }

        private void ChangeSelect3Option(string modelBound, string option)
        {
            var dropdown = this.driver
                .GetElementsByPropertyBind("value", modelBound)
                .First();

            dropdown.GetElementsByEventNameAndHandler("mousedown", "toggleDropdown()").First().Click();
            dropdown
                .GetElementsByEventNameAndHandler("mousedown", "selectItem(datum)")
                .Where(elem => elem.Text.Contains(option))
                .First()
                .Click();
        }

        public bool CheckPopoverPosition(string position)
        {
            switch (position)
            {
                case "top": return this.IsPopoverTopToButton();
                case "bottom": return this.IsPopoverBottomToButton();
                case "right": return this.IsPopoverRightToButton();
                case "left": return this.IsPopoverLeftToButton();
                default: throw new ArgumentException("Invalid position");
            }
        }

        public void TriggerPopover(string trigger)
        {
            switch (trigger)
            {
                case "click":
                case "insideClick":
                case "focus":
                    {
                        this.driver.FindElement(By.CssSelector(".btn-success")).Click();
                        this.SetVisualDelay(DefaultVidsualDelayInMiliseconds);
                        break;
                    }
                case "hover": this.HoverPopover(".btn-success"); break;
                default: throw new ArgumentException("Invalid position");
            }
        }

        private bool IsPopoverTopToButton()
        {
            var popoverY = this.driver.FindElement(By.CssSelector(".popover")).Location.Y;
            var buttonY = this.driver.FindElement(By.CssSelector(".btn-success")).Location.Y;
            return popoverY < buttonY;
        }

        private bool IsPopoverBottomToButton()
        {
            var popoverY = this.driver.FindElement(By.CssSelector(".popover")).Location.Y;
            var buttonY = this.driver.FindElement(By.CssSelector(".btn-success")).Location.Y;
            return popoverY > buttonY;
        }

        private bool IsPopoverRightToButton()
        {
            var popoverX = this.driver.FindElement(By.CssSelector(".popover")).Location.X;
            var buttonX = this.driver.FindElement(By.CssSelector(".btn-success")).Location.X;
            return popoverX > buttonX;
        }

        private bool IsPopoverLeftToButton()
        {
            var popoverX = this.driver.FindElement(By.CssSelector(".popover")).Location.X;
            var buttonX = this.driver.FindElement(By.CssSelector(".btn-success")).Location.X;
            return popoverX < buttonX;
        }

    }
}
