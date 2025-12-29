import { visit } from 'unist-util-visit';

export function remarkD2() {
  return (tree: any) => {
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (node.lang === 'd2') {
        const code = node.value;
        
        // Replace the code block with a D2Diagram component
        const newNode = {
          type: 'mdxJsxFlowElement',
          name: 'D2Diagram',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'code',
              value: code,
            },
          ],
          children: [],
        };

        if (parent && typeof index === 'number') {
            parent.children.splice(index, 1, newNode);
        }
      }
    });
  };
}
