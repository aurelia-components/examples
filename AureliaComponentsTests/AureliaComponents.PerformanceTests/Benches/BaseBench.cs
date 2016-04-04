namespace AureliaComponents.PerformanceTests.Benches
{
    public abstract class BaseBench
    {
        protected const string DefaultUri = "http://localhost:9000/#/test-grid/auto-height-parent-based";
        //protected const string DefaultUri = "http://localhost:9001";
        protected const int WARMUP_COUNT = 5;
    }
}
