import { Callout } from './Callout'
import { CodeTabs } from './CodeTabs'
import { Checklist } from './Checklist'
import { Diagram } from './Diagram'
import { AcceptanceCriteria, ClientBrief, CommitBox, Hint, Hints, InterviewQuestion, StarterCode } from './Blocks'

/** Components available inside every MDX lesson without importing them. */
export const mdxComponents = {
  Callout,
  CodeTabs,
  Checklist,
  Diagram,
  InterviewQuestion,
  AcceptanceCriteria,
  StarterCode,
  CommitBox,
  Hints,
  Hint,
  ClientBrief,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const external = props.href?.startsWith('http')
    return <a {...props} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} />
  },
}
