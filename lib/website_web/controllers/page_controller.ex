defmodule WebsiteWeb.PageController do
  use WebsiteWeb, :controller

  def title("firefox"), do: "Firefox"
  def title("useful_stuff"), do: "Useful Stuff"
  def title("jxlsplines"), do: "JXL Splines"
  def title("something"), do: "?"
  def title("contact"), do: "Profile & Contact"
  def title("splines"), do: "SVG to JPEG XL"
  def title("x27u"), do: "Acer Predator X27U OLED (2023)"
  def title("gallery"), do: "Gallery"

  def title(_), do: ""

  def index(conn, _params) do
    render(conn, "index.html", page_title: "w", description: "any of a large family (Gramineae synonym Poaceae) of monocotyledonous mostly herbaceous plants with jointed stems, slender sheathing leaves, and flowers borne in spikelets of bracts.")
  end

  def page(%{request_path: "/" <> page} = conn, _params) do
    conn
    |> assign(:page_title, title(page))
    |> render("#{page}.html")
  end

  def catmull_rom(conn, _params) do
    conn
    |> put_root_layout(false)
    |> render("catmull_rom.html")
  end

  def gallery(conn, _params) do
    conn
    |> put_root_layout(false)
    |> render("gallery.html")
  end
end
