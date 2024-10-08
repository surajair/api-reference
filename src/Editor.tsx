import { useAtom } from "jotai";
import { lsAiContextAtom, lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML } from "./core/main";
import { loadWebBlocks } from "./web-blocks";
import { useState } from "react";
import axios from "axios";
import { LayersIcon } from "lucide-react";

loadWebBlocks();

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { uuid: "meraki-ui", name: "Meraki UI", url: "https://chai-ui-blocks.vercel.app" },
    { uuid: "chaiblocks", name: "UI Blocks", url: "https://chaibuilder.com/chaiblocks" },
  ]);
  return (
    <ChaiBuilderEditor
      unsplashAccessKey={"import.meta.env.VITE_UNSPLASH_ACCESS_KEY"}
      showDebugLogs={true}
      autoSaveSupport={false}
      previewComponent={PreviewWeb}
      blocks={blocks}
      brandingOptions={brandingOptions}
      onSave={async ({ blocks, providers, brandingOptions }: any) => {
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-providers", JSON.stringify(providers));
        localStorage.setItem("chai-builder-branding-options", JSON.stringify(brandingOptions));
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return true;
      }}
      saveAiContextCallback={async (aiContext: string) => {
        setAiContext(aiContext);
        return true;
      }}
      aiContext={aiContext}
      askAiCallBack={async (type: "styles" | "content", prompt: string, blocks: ChaiBlock[]) => {
        console.log("askAiCallBack", type, prompt, blocks);
        return { blocks: [], usage: { completionTokens: 151, promptTokens: 227, totalTokens: 378 } };
      }}
      uploadMediaCallback={async () => {
        return { url: "https://picsum.photos/200" };
      }}
      getUILibraryBlock={async (uiLibrary, uiLibBlock) => {
        const response = await axios.get(
          uiLibrary.url + (!uiLibBlock.path ? "/" + uiLibBlock.uuid + ".html" : "/blocks/" + uiLibBlock.path),
        );
        const html = await response.data;
        const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
        return getBlocksFromHTML(`${htmlWithoutChaiStudio}`) as ChaiBlock[];
      }}
      getUILibraryBlocks={async (uiLibrary) => {
        try {
          const response = await axios.get(uiLibrary.url + "/blocks.json");
          const blocks = await response.data;
          return blocks.map((b) => ({ ...b, preview: uiLibrary.url.replace("chaiblocks", "") + b.preview }));
        } catch (error) {
          return [];
        }
      }}
      uiLibraries={uiLibraries}
      sideBarComponents={{
        top: [
          {
            icon: <LayersIcon size={20} />,
            label: "SEO Panel",
            component: () => <div>SEO Panel</div>,
          },
        ],
      }}
    />
  );
}

export default ChaiBuilderDefault;
