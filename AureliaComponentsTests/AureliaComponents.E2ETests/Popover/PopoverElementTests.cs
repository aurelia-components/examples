namespace AureliaComponents.E2ETests.Popover
{
    using FluentAssertions;
    using NUnit.Framework;

    using AureliaComponents.PageObjects;

    [TestFixture]
    public class PopoverElementTests
    {
        private PopoverPageObject pageObject;

        [TestFixtureSetUp]
        public void Init()
        {
            pageObject = new PopoverPageObject("C:\\");
            pageObject.NavigateTo("popover");
        }

        [Test]
        public void LoadPopoverElementView_ShouldCheckTitle()
        {
            pageObject.GetPageTitle.Should().Be("popover | Test Popover | Page Title");
        }

        [Test]
        public void ChangePopoverTitle_ShouldCheckPopoverTitle()
        {
            var titles = new[] { "gosho", "pesho", "tosho" };

            foreach (var title in titles)
            {
                pageObject.ChangePopoverTitle(title);
                pageObject.HoverPopover(".btn-success");
                pageObject.IsPopoverDisplayed();
                pageObject.GetPopoverTitle().Should().Be(title);
            }
        }

        [Test]
        public void ChangePopoverPosition_ShouldCompareToButton()
        {
            var positions = new[] { "right", "bottom", "left", "top" };

            foreach (var pos in positions)
            {
                pageObject.ChangePopoverPosition(pos);
                pageObject.HoverPopover(".btn-success");
                pageObject.CheckPopoverPosition(pos).Should().BeTrue();
            }
        }

        [Test]
        public void ChangeTriggerType_ShouldCheckIfPopoverIsDisplayed()
        {
            var triggers = new[] { "focus", "click", "hover", "insideClick" };

            foreach (var trigger in triggers)
            {
                pageObject.ChangePopoverTriggerType(trigger);
                pageObject.TriggerPopover(trigger);
                pageObject.IsPopoverDisplayed().Should().BeTrue();
            }
        }

        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}