namespace AureliaComponents.PageObjects
{
    using System.Collections.Generic;
    using System.Linq;

    using OpenQA.Selenium;

    public class GridPageObject : SkeletonPageObject
    {
        public GridPageObject(string driverPath)
            : base(driverPath, "#/test-grid/")
        {

        }

        public int GetGridRowsCount
        {
            get
            {
                return this.GetGridRows.Count();
            }
        }

        public IEnumerable<IWebElement> GetGridRows
        {
            get
            {
                return this.driver.FindElements(By.CssSelector("tbody tr"));
            }
        }

        public IEnumerable<string> GetGridColumnsTextsByFieldName(string fieldName)
        {
            return this.GetGridRows
                .Select(e => e.FindElements(By.CssSelector(string.Format("td[field=\"{0}\"", fieldName)))
                    .First().Text);
        }


        public void ClickAddItem()
        {
            this.Trigger("click", "addItem()");
        }

        public int GetAddedItemsCount()
        {
            return this.driver.GetElementsContainingText("td", "-1").Count();
        }

        public void ClickNextPage()
        {
            this.Trigger("click", "next()");
        }

        public void ClickPrevPage()
        {
            this.Trigger("click", "prev()");
        }

        public void ClickFirstPage()
        {
            this.Trigger("click", "first()");
        }

        public void ClickLastPage()
        {
            this.Trigger("click", "last()");
        }

        public void ToggleFilter()
        {
            this.Trigger("click", "toggleFilter()");
        }

        public void ClickPage(string page)
        {
            this.driver.GetElementsContainingText("a", page).First().Click();
        }

        public string GetGridSummary()
        {
            return this.driver.FindElement(By.ClassName("grid-summary")).Text;
        }

        public string GetActivePage()
        {
            return this.driver.FindElement(By.CssSelector(".page-item.active a")).Text;
        }

        public bool HasFilterRowElement()
        {
            try
            {
                return this.driver.FindElement(By.CssSelector(".grid-column-filters")).Displayed;
            }
            catch (NoSuchElementException ex)
            {
                return false;
            }
        }

        public void ChangeFilter(string value = null){
            var filter = this.driver.FindElements(By.CssSelector(".grid-column-filters input")).ToArray()[1];
            filter.Clear();

            if (!string.IsNullOrEmpty(value))
            {
                filter.SendKeys(value);
            }
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds * 5);
        }

        public void ClickActiveFalse()
        {
            this.driver.GetElementsByEventNameAndHandler("click", "buttonClicked()").ToArray()[1].Click();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds * 5);
        }

        public void ChangeNameSortDirection()
        {

            this.driver.GetElementsByEventNameAndHandler("click", "$column.changeDirectionSort()").ToArray()[3].Click();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds * 5);
        }

        public void ChangeIdSortDirection()
        {
            this.driver.GetElementsByEventNameAndHandler("click", "$column.changeDirectionSort()").First().Click();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds * 5);
        }

        public void ChangeGridSelectedRow(int splitterIndex, int gridIndex, int rowIndex)
        {
            var splitter = this.driver.FindElements(By.TagName("split-vertical")).ToArray()[splitterIndex];
            var grid = splitter.FindElements(By.TagName("grid")).ToArray()[gridIndex];
            var row = grid.GetElementsByEventNameAndHandler("click", "rowClicked($item)").ToArray()[rowIndex];
            row.Click();
            this.SetVisualDelay(DefaultVisualDelayInMiliseconds * 5);
        }

        public IEnumerable<string> GetSyncedGridColumnsTexts(int splitterIndex, int gridIndex)
        {
            var splitter = this.driver.FindElements(By.TagName("split-vertical")).ToArray()[splitterIndex];
            var grid = splitter.FindElements(By.TagName("grid")).ToArray()[gridIndex];
            return grid.FindElements(By.CssSelector("tbody tr")).Select(row => row.FindElement(By.TagName("span")).Text);
        }
    }
}
