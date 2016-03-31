namespace AureliaComponents.PageObjects
{
    using System.Collections.Generic;
    using System.Linq;

    using OpenQA.Selenium;

    public class AssignPageObject : SkeletonPageObject
    {
        public AssignPageObject()
            : base("#/test-assign/")
        {

        }

        public void ClickRow(int rowIndex)
        {
            this.driver.GetElementsByEventNameAndHandler("click", "rowClicked($item)").ToArray()[rowIndex].Click();
        }

        public void ClickMoveAllRight()
        {
            this.Trigger("click", "moveAllRight()");
        }

        public void ClickMoveAllLeft()
        {
            this.Trigger("click", "moveAllLeft()");
        }

        public void ClickMoveRight()
        {
            this.Trigger("click", "moveRight()");
        }

        public void ClickMoveLeft()
        {
            this.Trigger("click", "moveLeft()");
        }

        public int GetLeftItems()
        {
            return this.driver.GetElementsByPropertyBind("data", "leftItems").First().FindElements(By.CssSelector("tbody tr")).Count;
        }

        public int GetRightItems()
        {
            return this.driver.GetElementsByPropertyBind("data", "rightItems").First().FindElements(By.CssSelector("tbody tr")).Count;
        }
    }
}
