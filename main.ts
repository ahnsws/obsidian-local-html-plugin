import { MarkdownPostProcessorContext, Plugin, TFile } from "obsidian";

console.log("Running obsidian-local-html-plugin");

export default class LocalHTMLSrcPlugin extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor(
			(el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				// get active file
				const activeFile: TFile | null =
					this.app.workspace.getActiveFile();
				if (activeFile === null) {
					return;
				}

				// get active file directory
				const activeFilePath: string =
					this.app.vault.getResourcePath(activeFile);
				const activeFileDir: string = activeFilePath.substring(
					0,
					activeFilePath.lastIndexOf("/")
				);

				// remove system-specific prefix for assets
				const prefixes = [
					"app://obsidian.md/",
					"capacitor://localhost/",
				];

				// search active file for any iframes
				const iframes: HTMLIFrameElement[] = Array.from(
					el.querySelectorAll("iframe")
				).filter((el: HTMLIFrameElement) =>
					prefixes
						.map((prefix: string) => el.src.startsWith(prefix))
						.some((el: boolean) => el)
				);
				for (const iframe of iframes) {
					let iframeSrcIsRelative = false;

					let relPath: string = iframe.src;
					for (const prefix of prefixes) {
						if (relPath.startsWith(prefix)) {
							relPath = relPath.replace(prefix, "");
							iframeSrcIsRelative = true;
							break;
						}
					}

					if (iframeSrcIsRelative) {
						iframe.src = `${activeFileDir}/${relPath}`;
					}
				}
			}
		);
	}
}
