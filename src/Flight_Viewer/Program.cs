using System.Numerics;
using Flight_Viewer;
using OpenTK.Mathematics;

namespace FlightViewer
{
    class Program
    {
        static void Main(string[] args)
        {
            List<OpenTK.Mathematics.Vector3> flightPath = Loader.Load("400813.json");
            Game game = new Game(flightPath);
            game.Run();
        }
    }
}