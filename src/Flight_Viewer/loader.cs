using System;
using System.Diagnostics;
using System.Numerics;
using Newtonsoft.Json;
using OpenTK.Mathematics;

namespace Flight_Viewer
{
    public class Loader
    {
        public static List<OpenTK.Mathematics.Vector3> Load(string logFile)
        {
            Console.WriteLine("Loading Movement File...");
            // Load the file.
            string json = System.IO.File.ReadAllText(logFile);
            dynamic data = JsonConvert.DeserializeObject(json);

            List<OpenTK.Mathematics.Vector3> positions = new List<OpenTK.Mathematics.Vector3>();

            // Process the data.
            foreach (var item in data)
            {
                positions.Add(new OpenTK.Mathematics.Vector3(Convert.ToSingle(item.latitude.Value), Convert.ToSingle(item.longitude.Value), Convert.ToSingle(item.altitude.Value)));
            }
            return positions;
        }
    }
}