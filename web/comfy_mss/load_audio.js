import { getWidget } from "./utils.js";
import { setNodeWidth } from "./sizing.js";
import { t } from "./i18n.js";

function addAudioUploadButton(node, api) {
  const widget = getWidget(node, "audio");
  if (!widget || node.comfyMssUploadButtonAdded) return;
  node.comfyMssUploadButtonAdded = true;
  const button = node.addWidget("button", t("uploadAudio", "Upload Audio"), null, async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*,video/*,.wav,.flac,.mp3,.m4a,.ogg,.aac,.aiff,.aif,.wma,.opus";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const body = new FormData();
      body.append("audio", file);
      const response = await api.fetchApi("/comfy-mss/upload-audio", { method: "POST", body });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      if (Array.isArray(widget.options?.values) && !widget.options.values.includes(result.name)) {
        widget.options.values.push(result.name);
        widget.options.values.sort((a, b) => a.localeCompare(b));
      }
      widget.value = result.name;
      widget.callback?.(result.name);
      node.setDirtyCanvas(true, true);
    };
    input.click();
  });
  button.comfyMssI18nKey = "uploadAudio";
}

export function registerLoadAudioNode(nodeType, wrapOnNodeCreated, api) {
  wrapOnNodeCreated(function () {
    // Keep the optional runtime metadata input in the schema for external
    // hosts, but do not expose it in the regular ComfyUI widget panel.
    const inputNameWidget = getWidget(this, "input_name");
    if (inputNameWidget) {
      inputNameWidget.hidden = true;
    }
    addAudioUploadButton(this, api);
    setNodeWidth(this);
  });
}
