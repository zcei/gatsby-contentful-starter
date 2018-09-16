const crypto = require(`crypto`)
const uuidv4 = require(`uuid/v4`)
const _ = require('lodash')

function digest (nodeContent) {
  return crypto
    .createHash(`md5`)
    .update(nodeContent)
    .digest(`hex`)
}

exports.onCreateNode = function (
  { node, getNode, loadNodeContent, actions, createNodeId },
  pluginOptions
) {
  const { createNode, createParentChildLink } = actions

  // A third party schema has been added
  if (node.internal.type !== 'GraphQLSource') {
    // TEST: check whether markdown remark node gets created
    if (node.internal.type === 'MarkdownRemark') {
      console.log('remark triggered')
    }

    return
  }

  if (!pluginOptions.schemas[node.fieldName]) {
    return
  }

  const nodeId = createNodeId(`graphql-transformer-directives-${node.fieldName}`)
  const directivesNode = createDirectivesNode({
    id: nodeId,
    parent: node,
    queryFieldName: node.fieldName
  })

  createNode(directivesNode)
  createParentChildLink({ parent: node, child: directivesNode })

  const CONTENT = `# Hello Markdown`

  // Faked, just create a markdown text node
  const textDirectiveNode = {
    id: createNodeId(`${node.typeName}BlogPostBodyTextNode`),
    parent: directivesNode.id,
    children: [],
    internal: {
      type: _.camelCase(`GraphQLSourceContentfulBlogPostTextNode`),
      mediaType: `text/markdown`,
      content: CONTENT,
      contentDigest: digest(CONTENT),
      ignoreType: true,
    }
  }

  console.log(`creatiiiiiiiiing`, node.fieldName, textDirectiveNode.id)

  createNode(textDirectiveNode)
  createParentChildLink({ parent: directivesNode, child: textDirectiveNode })
}

function createDirectivesNode ({ id, parent, queryFieldName }) {
  const nodeContent = uuidv4()
  const nodeContentDigest = digest(nodeContent)
  return {
    id,
    queryFieldName: queryFieldName,
    parent: parent.id,
    children: [],
    internal: {
      type: `GraphQLSourceDirectives`,
      contentDigest: nodeContentDigest,
      ignoreType: true,
    },
  }
}
