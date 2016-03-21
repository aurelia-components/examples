namespace AureliaComponents.E2ETests.Grid
{
    using System.Linq;

    using FluentAssertions;
    using NUnit.Framework;

    using AureliaComponents.PageObjects;

    [TestFixture]
    public class GrydSyncingTests
    {
        private GridPageObject pageObject;

        [TestFixtureSetUp]
        public void Init()
        {
            pageObject = new GridPageObject("C:\\");
            pageObject.NavigateTo("sync-two-grids");
        }

        [Test]
        public void LoadFSyncingView_ShouldCheckTitle()
        {
            pageObject.GetPageTitle.Should().Be("sync two grids | Test Grid | Page Title");
        }

        [Test]
        public void ClickGridsSelectedRows_ShouldCheckRelatedGridsContent()
        {
            //first splitter
            var rolesBefore = pageObject.GetSyncedGridColumnsTexts(0, 1);
            pageObject.ChangeGridSelectedRow(0, 0, 2);

            var rolesAfter = pageObject.GetSyncedGridColumnsTexts(0, 1).ToArray();
            rolesBefore.Should().NotBeEquivalentTo(rolesAfter);

            //second splitter
            var pirvillagesBefore = pageObject.GetSyncedGridColumnsTexts(1, 1);
            pageObject.ChangeGridSelectedRow(1, 0, 2);

            var privillagesAfter = pageObject.GetSyncedGridColumnsTexts(1, 1).ToArray();
            pirvillagesBefore.Should().NotBeEquivalentTo(privillagesAfter);

            //third splitter
            var usersBefore = pageObject.GetSyncedGridColumnsTexts(2, 1).ToArray();
            pageObject.ChangeGridSelectedRow(2, 0, 2);

            var usersAfter = pageObject.GetSyncedGridColumnsTexts(2, 1);
            usersBefore.Should().NotBeEquivalentTo(usersAfter);
        }

        [TestFixtureTearDown]
        public void Dispose()
        {
            pageObject.Quit();
        }
    }
}
