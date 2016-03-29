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

        [Test]
        [TestFixtureSetUp]
        public void Assign_Init()
        {
            pageObject = new AssignPageObject("C:\\");
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
            pageObject.GetRightItems().Should().Be(6);

            pageObject.ClickRow(0);
            pageObject.ClickMoveLeft();
            pageObject.GetLeftItems().Should().Be(1);
            pageObject.GetRightItems().Should().Be(5);

            pageObject.ClickRow(2);
            pageObject.ClickMoveLeft();
            pageObject.GetLeftItems().Should().Be(2);
            pageObject.GetRightItems().Should().Be(4);

            pageObject.ClickMoveAllLeft();
            pageObject.GetLeftItems().Should().Be(6);
            pageObject.GetRightItems().Should().Be(0);

            pageObject.ClickRow(0);
            pageObject.ClickMoveRight();
            pageObject.GetLeftItems().Should().Be(5);
            pageObject.GetRightItems().Should().Be(1);

            pageObject.ClickRow(2);
            pageObject.ClickMoveRight();
            pageObject.GetLeftItems().Should().Be(4);
            pageObject.GetRightItems().Should().Be(2);
            
        }

        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}
