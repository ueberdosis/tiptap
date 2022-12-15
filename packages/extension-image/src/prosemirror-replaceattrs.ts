import {
  Fragment, Node, Schema, Slice,
} from 'prosemirror-model'
import { Step, StepResult } from 'prosemirror-transform'

// https://www.npmjs.com/package/prosemirror-replaceattrs
export class ReplaceAttrsStep extends Step {
  /**
   * {@inheritDoc}
   */
  public static fromJSON(_schema: Schema, json: any) {
    return new ReplaceAttrsStep(json.at, json.attrs)
  }

  /**
   * @param at The position of node whose attrs should be updated.
   * @param attrs New attribues to set.
   */
  constructor(public at: number, public attrs: any) {
    super()
  }

  /**
   * {@inheritDoc}
   */
  public apply(doc: Node) {
    const node = doc.nodeAt(this.at)

    if (!node) {
      return StepResult.fail('Node could not be found')
    }

    const newNode: any = node.copy()

    newNode.attrs = this.attrs

    return StepResult.ok(
      doc.replace(this.at, this.at + 1, new Slice(Fragment.from(newNode), 0, 0)),
    )
  }

  /**
   * {@inheritDoc}
   */
  public invert(doc: Node) {
    return new ReplaceAttrsStep(this.at, doc.nodeAt(this.at)!.attrs)
  }

  /**
   * {@inheritDoc}
   */
  public map(mapping: any) {
    const at = mapping.mapResult(this.at)

    return at.deleted ? null : new ReplaceAttrsStep(this.at, this.attrs)
  }

  /**
   * {@inheritDoc}
   */
  public merge(other: Step): Step | null {
    if (other instanceof ReplaceAttrsStep && other.at === this.at) {
      return new ReplaceAttrsStep(this.at, this.attrs)
    }

    return null
  }

  /**
   * {@inheritDoc}
   */
  public toJSON() {
    return {
      attrs: this.attrs,
      at: this.at,
      stepType: 'replaceAttrs',
    }
  }
}

Step.jsonID('replaceAttrs', ReplaceAttrsStep)
