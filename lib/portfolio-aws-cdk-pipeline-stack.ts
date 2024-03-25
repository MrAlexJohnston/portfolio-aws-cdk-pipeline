import { Stack, type StackProps } from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines'

import cdkReposData from './cdk-repos.json'

interface RepoInfo {
  branch: string
  repo: string
  owner: string
}

const cdkRepos: RepoInfo[] = cdkReposData

export class PortfolioAwsCdkPipelineStack extends Stack {
  constructor (scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    for (const { branch, repo, owner } of cdkRepos) {
      const pipelineName = restructureRepo(repo)
      new CodePipeline(this, pipelineName, {
        pipelineName,
        synth: new ShellStep('Synth', {
          input: CodePipelineSource.gitHub(`${owner}/${repo}`, branch),
          commands: ['npm ci', 'npm run build', 'npx cdk synth']
        })
      })
    }
  }
}

function restructureRepo (repo: string): string {
  return repo.split('-')
    .map(string => string.charAt(0).toUpperCase() + string.slice(1))
    .join('')
}
