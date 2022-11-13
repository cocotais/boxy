import "./workspace/workspace.css";
import "./icon/category/category";
import "./icon/category/category.css";
import "./toolbox/toolbox.css";
import "./search/search.css";
import "./navigation/navigation";
import "./navigation/navigation.css";
import "./zoomBox/zoomBox.css";

import { setBoxyCategory } from "./toolbox/toolbox";
import { loadWorkspace } from "./workspace/workspace";

setBoxyCategory();
loadWorkspace();
