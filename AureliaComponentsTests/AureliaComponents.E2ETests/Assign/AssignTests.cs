namespace AureliaComponents.E2ETests.Assign
{
    using System.Linq;

    using FluentAssertions;
    using NUnit.Framework;

    using AureliaComponents.PageObjects;

    [TestFixture]
    public class AssignTests
    {
        private AssignPageObject pageObject;

        [TestFixtureSetUp]
        public void Init()
        {
            pageObject = new AssignPageObject("C:\\");
            pageObject.NavigateTo();
        }

        [Test]
        public void LoadAssignView_ShouldCheckTitle()
        {
            pageObject.GetPageTitle.Should().Be("Test Assign | Page Title");
        }

        [Test]
        public void SwitchItemsFromLeftToRightAndViceVersa_ShouldCheckPanelsContents()
        {
            pageObject.ClickMoveAllRight();
            pageObject.GetLeftItems().Should().Be(0);
        }

        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}
