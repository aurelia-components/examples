namespace AureliaComponents.PerformanceTests
{
    using System;

    public class PLogEntry
    {
        private string message;

        public PLogEntry(string name, long ts, long duration, string message)
        {
            this.Name = name;
            this.Timestamp = ts;
            this.Duration = duration;
            this.message = message;
        }

        public string Name { get; private set; }

        public long Timestamp { get; private set; }

        public long Duration { get; private set; }

        public override string ToString()
        {
            return "PLogEntry{" +
                    "name='" + this.Name + '\'' +
                    ", ts=" + this.Timestamp +
                    ", duration=" + this.Duration +
                    ", message='" + this.message + '\'' +
                    '}';
        }
    }
}
