﻿namespace AureliaComponents.E2ETests.Grid
{
    using System;

    using FluentAssertions;
    using NUnit.Framework;

    using AureliaComponents.PageObjects;

    [TestFixture]
    public class GridPagingTests
    {
        private GridPageObject pageObject;

        [TestFixtureSetUp]
        public void Paging_Init()
        {
            pageObject = new GridPageObject();
            pageObject.NavigateTo("pagination");
        }

        [Test]
        public void LoadPagingView_ShouldCheckTitle()
        {
            pageObject.GetPageTitle.Should().Be("pagination | Test Grid | Page Title");
        }

        [Test]
        public void ChangeGridPages_ShouldCheckActivePage()
        {
            for (int i = 6; i < 16; i++)
            {
                pageObject.ClickNextPage();
                pageObject.GetActivePage().Should().Be(i.ToString());
            }

            pageObject.ClickPrevPage();
            pageObject.GetActivePage().Should().Be("14");

            pageObject.ClickLastPage();
            pageObject.GetActivePage().Should().Be("100");

            pageObject.ClickFirstPage();
            pageObject.GetActivePage().Should().Be("1");

            pageObject.ClickPage("7");
            pageObject.GetActivePage().Should().Be("7");
        }

        [Test]
        public void ChangePageSizes_ShouldCheckGridRowsCount()
        {
            int[] sizes = { 50, 25, 10 };

            foreach (var size in sizes)
            {
                pageObject.ChangeSelectMenu(size.ToString());
                pageObject.GetGridRowsCount.Should().Be(size);
                pageObject.GetGridSummary().Should().Be(string.Format("Showing 1 - {0} of 1000 items", size));
            }

        }

        [Test]
        public void ClickAddItem_ShouldCheckAddedRowsCount()
        {
            var rows = new Random().Next(1, 11);

            for (int i = 0; i < rows; i++)
            {
                pageObject.ClickAddItem();
            }

            pageObject.GetAddedItemsCount().Should().Be(rows);
        }

        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}
