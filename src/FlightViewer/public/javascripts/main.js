import { Renderer } from '../javascripts/renderer.js';
import { UIController} from '../javascripts/uiController.js';

function init () {
    let mainRenderer = new Renderer(500, 500);
    let uiController = new UIController();

    mainRenderer.animate();
}

init();