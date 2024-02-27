using OpenTK;
using OpenTK.Graphics;
using OpenTK.Graphics.OpenGL;
using OpenTK.Input;
using OpenTK.Mathematics;
using OpenTK.Windowing.Common;
using OpenTK.Windowing.Desktop;

namespace Flight_Viewer
{
    class Game : GameWindow
    {
        private List<Vector3> flightPath;
        public Game(List<Vector3> FlightPath): base(GameWindowSettings.Default, NativeWindowSettings.Default)
        {
            this.flightPath = FlightPath;
        }

        protected override void OnLoad()
        {
            base.OnLoad();
            GL.ClearColor(1.0f, 1.0f, 1.0f, 1.0f);
        }

        protected override void OnUpdateFrame(FrameEventArgs e)
        {
            base.OnUpdateFrame(e);
        }

        protected override void OnRenderFrame(FrameEventArgs e)
        {
            base.OnRenderFrame(e);
            GL.Clear(ClearBufferMask.ColorBufferBit | ClearBufferMask.DepthBufferBit);

            // Get the bounding box of the points.
            Vector3 min = new Vector3(float.MaxValue, float.MaxValue, float.MaxValue);
            Vector3 max = new Vector3(float.MinValue, float.MinValue, float.MinValue);
            foreach (Vector3 point in flightPath)
            {
                min = Vector3.ComponentMin(min, point);
                max = Vector3.ComponentMax(max, point);
            }
            Vector3 center = (min + max) / 2.0f;
            float size = Math.Max(max.X - min.X, Math.Max(max.Y - min.Y, max.Z - min.Z));

            // Set up perspective projection.
            Matrix4 projection = Matrix4.CreatePerspectiveFieldOfView(
                MathHelper.DegreesToRadians(45.0f),
                (float)Size.X / Size.Y,
                0.1f,
                100f
            );
            GL.MatrixMode(MatrixMode.Projection);
            GL.LoadMatrix(ref projection);

            // Set up the camera.
            Matrix4 view = Matrix4.LookAt(center + new Vector3(0, 0, size * 1.5f), center, Vector3.UnitY);
            GL.MatrixMode(MatrixMode.Modelview);
            GL.LoadMatrix(ref view);

            // Draw the flight path.
            GL.Color3(1.0f, 0.0f, 0.0f);
            GL.Begin(PrimitiveType.LineStrip);
            foreach (Vector3 point in flightPath)
            {
                GL.Vertex3(point);
            }

            GL.End();

            SwapBuffers();
        }
    }
}