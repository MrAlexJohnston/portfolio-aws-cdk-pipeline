import { Stack, type StackProps, SecretValue } from 'aws-cdk-lib'
import { type Construct } from 'constructs'
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline'
import { GitHubSourceAction, GitHubTrigger, CodeBuildAction, CodeBuildActionType } from 'aws-cdk-lib/aws-codepipeline-actions'
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild'

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
      const sourceOutput = new Artifact(`${pipelineName}SourceOutput`)
      const buildOutput = new Artifact(`${pipelineName}BuildOutput`)
      const deployOutput = new Artifact(`${pipelineName}DeployOutput`)
      const codeBuildProject = new PipelineProject(this, `${pipelineName}CodeBuild`, {
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            build: {
              commands: [
                'npm install',
                'npx cdk synth'
              ]
            }
          }
        }),
        environment: {
          buildImage: LinuxBuildImage.STANDARD_7_0
        }
      })
      const codeDeployProject = new PipelineProject(this, `${pipelineName}CodeDeploy`, {
        buildSpec: BuildSpec.fromObject({
          version: '0.2',
          phases: {
            build: {
              commands: [
                'npm install',
                'npx deploy'
              ]
            }
          }
        }),
        environment: {
          buildImage: LinuxBuildImage.STANDARD_7_0
        }
      })

      new Pipeline(this, pipelineName, {
        stages: [
          {
            stageName: 'Source',
            actions: [
              new GitHubSourceAction({
                actionName: 'GitHubSource',
                owner,
                repo,
                branch,
                oauthToken: SecretValue.secretsManager('github-token'),
                output: sourceOutput,
                trigger: GitHubTrigger.WEBHOOK
              })
            ]
          },
          {
            stageName: 'Build',
            actions: [
              new CodeBuildAction({
                actionName: 'Build',
                type: CodeBuildActionType.BUILD,
                project: codeBuildProject,
                input: sourceOutput,
                outputs: [buildOutput]
              })
            ]
          },
          {
            stageName: 'Deploy',
            actions: [
              new CodeBuildAction({
                actionName: 'Deploy',
                type: CodeBuildActionType.BUILD,
                project: codeDeployProject,
                input: sourceOutput,
                outputs: [deployOutput]
              })
            ]
          }
        ]
      })
    }
  }
}

function restructureRepo (repo: string): string {
  return repo.split('-')
    .map(string => string.charAt(0).toUpperCase() + string.slice(1))
    .join('')
}
