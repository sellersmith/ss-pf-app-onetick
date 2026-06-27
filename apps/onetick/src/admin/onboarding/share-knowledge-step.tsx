// OneTick onboarding UI mirrors TailorKit flow while using PageFly AdminAppHost and app API ports.
import { BlockStack, Card, Image, InlineStack, Text } from '@shopify/polaris'
import React from 'react'

const ONETICK_SNACK_IMAGE = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/onetick-snack.png'

export const ShareKnowledgeStep: React.FC = () => (
  <Card padding="600">
    <BlockStack gap="300">
      <Text as="p">
        You've probably heard McDonald's famous question:{' '}
        <b>
          <i>Do you want fries with that?</i>
        </b>{' '}
        - a classic example of upselling and cross-selling.
      </Text>

      <InlineStack align="center">
        <Image alt="About add-on products" source={ONETICK_SNACK_IMAGE} width="342px" height="140px" />
      </InlineStack>

      <Text as="p">
        While many focus on best practices, we believe the key is <b>understanding your customers</b>.
      </Text>

      <Text as="p">
        To increase sales, you need to understand what your customers truly need. McDonald's increases revenue by
        15-40% with this because they know fries go perfectly with a Big Mac, not a sports drink.
      </Text>

      <Text as="p" variant="bodyMd">
        Before you start, think about what your customers want. This simple principle will help you create the right
        offers.
      </Text>

      <Text as="p">We'll share more tips along the way. Stay tuned.</Text>
    </BlockStack>
  </Card>
)
