namespace AureliaComponents.E2ETests.Popover
{
    using FluentAssertions;
    using NUnit.Framework;

    using AureliaComponents.PageObjects;

    [TestFixture]
    public class PopoverAttributeTests
    {
        private PopoverPageObject pageObject;

        [TestFixtureSetUp]
        public void Init()
        {
            pageObject = new PopoverPageObject("C:\\");
            pageObject.NavigateTo("popover-attribute");
        }

        [Test]
        public void LoadPopoverAttributeView_ShouldCheckTitle()
        {
            pageObject.GetPageTitle.Should().Be("popover atttribute example | Test Popover | Page Title");
        }

        [Test]
        public void HoverPopoverAttribute_ShouldCheckIfPopoverAppeared()
        {
            string newText = "I assume you want to change this";
            pageObject.IsPopoverDisplayed().Should().BeFalse();
            pageObject.ChangePopoverContent(newText);
            pageObject.HoverPopover("a[popover]");
            pageObject.IsPopoverDisplayed().Should().BeTrue();
            pageObject.GetPopoverContent().Should().Contain(string.Format("zdrasti tsveti; {0}", newText));
        }


        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}
