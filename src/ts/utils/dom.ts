export type ValueElement = HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement;

export const DOM = {
    getActiveEditElement(): ValueElement {
        // stolen from Surfingkeys. Needs work.
    
        let element = document.activeElement;
        // on some pages like chrome://history/, input is in shadowRoot of several other recursive shadowRoots.
        while (element?.shadowRoot) {
            if (element.shadowRoot.activeElement) {
                element = element.shadowRoot.activeElement;
            } else {
                const subElement = element.shadowRoot.querySelector('input, textarea, select');
                if (subElement) {
                    element = subElement;
                }
                break;
            }
        }
        return element as ValueElement;
    },
    
    getTopLevelBlocks() {
        return document.querySelector('.roam-article div .flex-v-box') as HTMLElement;
    },
    
    getLastTopLevelBlock() {
      const lastChild = this.getTopLevelBlocks().lastChild as HTMLElement;
      return lastChild.querySelector('.roam-block, textarea') as HTMLElement; 
    },
    
    getFirstTopLevelBlock() {
      const firstChild = this.getTopLevelBlocks().firstChild as HTMLElement;
      return firstChild.querySelector('.roam-block, textarea') as HTMLElement; 
    },
    
    
    getInputEvent() {
        return new Event('input', {
            bubbles: true,
            cancelable: true,
        });
    },
    
    async detectChange(fn: () => void, el?: HTMLElement){
        const targetNode = el || document.querySelector('.roam-body-main') as HTMLElement;
        const config = { attributes: true, childList: true, subtree: true };
        return new Promise(async resolve => {
            const callback = function(mutationsList:MutationRecord[], observer: MutationObserver) {
                // Use traditional 'for loops' for IE 11
                // console.log(mutationsList)
                // for(let mutation of mutationsList) {
                //     if (mutation.type === 'childList') {
                //         console.log('A child node has been added or removed.');
                //     }
                //     else if (mutation.type === 'attributes') {
                //         console.log('The ' + mutation.attributeName + ' attribute was modified.');
                //     }
                // }
                resolve('mutated')
                observer.disconnect();
            };
            const observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
            await fn();
        })
    },
    
    getBlockContainer(element?: HTMLElement) {
        let parent = null; 
        let el = element || document.querySelector('textarea') as HTMLElement
        while(el && !parent){
            // console.log(el.parentElement)
            if (el.parentElement?.className?.includes('flex-v-box roam-block-container')) {
                parent = el?.parentElement;
            }
            el = el?.parentElement as HTMLElement;
        }
        return parent as HTMLElement
    },
    
    getBlockParent(element: HTMLElement){
        return this.getBlockContainer(this.getBlockContainer(element));
    },
    
    isTopLevelBlock(element: HTMLElement){
        return !this.getBlockParent(element);
    },
    
    hasChildren(element: HTMLElement){
        return !!this.getBlockChildren(element)?.length;
    },
    
    getBlockChildren(element: HTMLElement) : HTMLCollection{
        const childrenDiv = this.getBlockContainer(element)?.lastChild as HTMLElement;
        // console.log(childrenDiv)
        // console.log(childrenDiv.children)
        return childrenDiv?.children;
    },
    getNthChild(element: HTMLElement, n:number){
        return this.getBlockChildren(element)?.[n].querySelector('.roam-block') as HTMLElement;
    },
    getFirstChild(element: HTMLElement){
        return this.getNthChild(element, 0);
    },
    getLastChild(element: HTMLElement){
        return this.getNthChild(element,this.getBlockChildren(element).length-1);
    },
    hasSiblings(element: HTMLElement) {
        return !!this.getSiblings(element)
    },
    getSiblings(element: HTMLElement):  HTMLCollection {
        if (this.isTopLevelBlock(element)) {
            return this.getBlockContainer(element)?.parentElement?.children as HTMLCollection
        } else {
            return this.getBlockChildren(this.getBlockParent(element))
        }
    },
    getNthSibling(element:HTMLElement, n:number) {
        return this.getSiblings(element)?.[n].querySelector('.roam-block');
    },
    getFirstSibling(element: HTMLElement){
        return this.getNthSibling(element, 0);
    },
    getLastSibling(element: HTMLElement){
        return this.getNthSibling(element,this.getSiblings(element).length-1);
    },
}
