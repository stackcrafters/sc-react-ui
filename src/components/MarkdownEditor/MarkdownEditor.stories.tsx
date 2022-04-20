import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import MarkdownEditor from './MarkdownEditor';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/MarkdownEditor',
  component: MarkdownEditor,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // defaultValue: { control: { type: 'string' } }
  }
} as ComponentMeta<typeof MarkdownEditor>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MarkdownEditor> = (args) => <MarkdownEditor {...args} />;

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
  initialContent: undefined
};

export const WithDefaultValue = Template.bind({});
WithDefaultValue.args = {
  initialContent: `
# Heading one
# Heading _italic_ one

## Heading two

### Heading three

#### Heading four

##### Heading five

###### Heading six

Normal paragraph

_italic text_
nested _italic text_ as a leaf

**bold text**
nested **bold text** as a leaf

~~strike through text~~
nested ~~strike through text~~ as a leaf

this is a [hyperlink](https://jackhanford.com "with a title")

> A block quote.

- bullet list item  
  - here
- bullet list item

1. ordered list item
1. ordered list item

<center>Centered text</center>

![bacon](https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Made20bacon.png/330px-Made20bacon.png "a title")

image above
\`\`\`
  some code
\`\`\`

<iframe width="500" height="250" class="remirror-iframe remirror-iframe-custom" src="https://remirror.io/" data-embed-type="custom" allowfullscreen="true" frameborder="0"></iframe>

end


`
};
