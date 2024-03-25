import { Stack, type StackProps } from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines'

interface RepoInfo {
  branch: string
  repo: string
  owner: string
}

export class PortfolioAwsCdkPipelineStack extends Stack {
  constructor (scope: Construct, id: string, repoInfo: RepoInfo, props?: StackProps) {
    super(scope, id, props)

    const { branch, repo, owner } = repoInfo
    const pipelineName = this.restructureRepo(repo)
    new CodePipeline(this, pipelineName, {
      pipelineName,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(`${owner}/${repo}`, branch),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    })
  }

  private restructureRepo (repo: string): string {
    return repo.split('-')
      .map(string => string.charAt(0).toUpperCase() + string.slice(1))
      .join('')
  }
}
