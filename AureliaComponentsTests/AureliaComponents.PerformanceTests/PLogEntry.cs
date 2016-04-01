namespace AureliaComponents.PerformanceTests
{
    using System;

    public class PLogEntry
    {
        private string name;
        private long ts;
        private long duration;
        private string message;

        public PLogEntry(string name, long ts, long duration, string message)
        {
            this.name = name;
            this.ts = ts;
            this.duration = duration;
            this.message = message;
        }

        public string GetName()
        {
            return name;
        }

        public long GetTs()
        {
            return ts;
        }

        public long GetDuration()
        {
            return duration;
        }

        public string GetMessage()
        {
            return message;
        }


        public override string ToString()
        {
            return "PLogEntry{" +
                    "name='" + name + '\'' +
                    ", ts=" + ts +
                    ", duration=" + duration +
                    ", message='" + message + '\'' +
                    '}';
        }
    }
}
