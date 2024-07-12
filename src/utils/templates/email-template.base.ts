export class EmailTemplateBase {
	protected static template(content: string) {
		return `
        ${this.header()}
        ${content}  
        ${this.footer()}
        `;
	}

	private static header() {
		return ``;
	}

	private static footer() {
		return ``;
	}
}
