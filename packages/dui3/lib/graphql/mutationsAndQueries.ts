import { graphql } from '~~/lib/common/generated/gql'

export const createCommitMutation = graphql(`
  mutation CommitCreate($commit: CommitCreateInput!) {
    commitCreate(commit: $commit)
  }
`)

export const createModelMutation = graphql(`
  mutation CreateModel($input: CreateModelInput!) {
    modelMutations {
      create(input: $input) {
        id
        name
      }
    }
  }
`)

export const createProjectMutation = graphql(`
  mutation CreateProject($input: ProjectCreateInput) {
    projectMutations {
      create(input: $input) {
        id
        name
      }
    }
  }
`)

export const projectDetailsQuery = graphql(`
  query ProjectDetails($projectId: String!) {
    project(id: $projectId) {
      id
      role
      name
      team {
        user {
          avatar
          id
          name
        }
      }
      visibility
    }
  }
`)

export const modelDetailsQuery = graphql(`
  query ModelDetails($modelId: String!, $projectId: String!) {
    project(id: $projectId) {
      id
      model(id: $modelId) {
        id
        displayName
        versions {
          totalCount
        }
        author {
          id
          name
          avatar
        }
      }
    }
  }
`)