namespace AureliaComponents.E2ETests.Grid
{
    using System.Linq;

    using FluentAssertions;
    using NUnit.Framework;

    using AureliaComponents.PageObjects;

    [TestFixture]
    public class GridFilteringTests
    {
        private GridPageObject pageObject;

        [Test]
        [TestFixtureSetUp]
        public void Filtering_Init()
        {
            pageObject = new GridPageObject("C:\\");
            pageObject.NavigateTo("filters");
        }

        [Test]
        public void LoadFilteringView_ShouldCheckTitle()
        {
            pageObject.GetPageTitle.Should().Be("filters | Test Grid | Page Title");
        }

        [Test]
        public void ClickFilterToogleBtn_ShouldCheckIfRowIsHidden()
        {
            pageObject.HasFilterRowElement().Should().BeTrue();
            pageObject.ToggleFilter();
            pageObject.HasFilterRowElement().Should().BeFalse();
            pageObject.ToggleFilter();
            pageObject.HasFilterRowElement().Should().BeTrue();
        }

        [Test]
        public void ChangeFitlers_ShouldCheckDataInTheGrid()
        {
            pageObject.ChangeFilter("alex");
            pageObject.GetGridColumnsTextsByFieldName("name").All(col => col.Contains("alex")).Should().BeTrue();

            pageObject.ChangeFilter();

            pageObject.ChangeSelectMenu("end with 5");
            pageObject.GetGridColumnsTextsByFieldName("type").All(col => col.Contains("5")).Should().BeTrue();

            pageObject.ClickActiveFalse();
            pageObject.GetGridColumnsTextsByFieldName("name").Should().BeNullOrEmpty();
            pageObject.ClickActiveFalse();
        }

        [Test]
        public void SortColumnsAscDesc_ShouldCheckIfDataIsSorted()
        {
            pageObject.ChangeNameSortDirection();
            pageObject.ChangeIdSortDirection();
            pageObject.ChangeIdSortDirection();

            pageObject.ChangeNameSortDirection();
            var rows = pageObject.GetGridColumnsTextsByFieldName("name").ToArray();

            rows.Should().BeInAscendingOrder();

            pageObject.ChangeIdSortDirection();
            var idRows = pageObject.GetGridColumnsTextsByFieldName("id").ToArray();

            for (int i = 1; i < rows.Length; i++)
            {
                if (rows[i - 1] == rows[i])
                {
                    idRows[i - 1].CompareTo(rows[i]).Should().BeLessOrEqualTo(0);
                }
            }
        }

        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}
