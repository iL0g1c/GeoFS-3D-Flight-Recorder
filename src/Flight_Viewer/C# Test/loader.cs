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
            const float EARTH_RADIUS = 6371000.0f;
            Console.WriteLine("Loading Movement File...");
            // Load the file.
            string json = System.IO.File.ReadAllText(logFile);
            dynamic data = JsonConvert.DeserializeObject(json);

            List<OpenTK.Mathematics.Vector3> positions = new List<OpenTK.Mathematics.Vector3>();

            // Process the data.
            foreach (var item in data)
            {
                OpenTK.Mathematics.Vector3 cartesianCoordinates = new OpenTK.Mathematics.Vector3(
                    Convert.ToSingle((EARTH_RADIUS + item.altitude.Value) * Math.Cos(item.latitude.Value) * Math.Cos(item.longitude.Value)),
                    Convert.ToSingle((EARTH_RADIUS + item.altitude.Value) * Math.Cos(item.latitude.Value) * Math.Sin(item.longitude.Value)),
                    Convert.ToSingle((EARTH_RADIUS + item.altitude.Value) * Math.Sin(item.latitude.Value - EARTH_RADIUS))
                );
                positions.Add(cartesianCoordinates);
            }
            return positions;
        }
    }
}