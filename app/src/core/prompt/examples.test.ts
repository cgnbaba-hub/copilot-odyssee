import bundle from '../../content/bundle.generated';
import { evaluatePrompt } from './feedback';

// An example prompt is shown as the model answer, so it must pass its own rubric.
describe('example prompts in the content', () => {
  bundle.modules.forEach((module) =>
    module.blocks.forEach((block) => {
      if (block.type !== 'prompt' || !block.examplePrompt) return;
      const example = block.examplePrompt;
      it(`${module.id}/${block.id} scores 100 in German and English`, () => {
        expect(evaluatePrompt(example.de, block.rubric).missing).toEqual([]);
        expect(evaluatePrompt(example.en, block.rubric).missing).toEqual([]);
      });
    })
  );
});
