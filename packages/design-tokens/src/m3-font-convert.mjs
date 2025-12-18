import { kebabCase } from 'scule';

const typographyTokens = {
  Static: {
    'Display Large': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15567',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15568',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19366',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 57,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15509',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 64,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15511',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: -0.25,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15510',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Display Medium': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15565',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15566',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19370',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 45,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15512',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 52,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15513',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15514',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Display Small': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15563',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15564',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19373',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 36,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15515',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 44,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15517',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15516',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Headline Large': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15561',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15562',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19376',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 32,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15518',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 40,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15520',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15519',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Headline Medium': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15559',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15560',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19379',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 28,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15521',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 36,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15525',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15523',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Headline Small': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15557',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15558',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19382',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 24,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15522',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 32,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15526',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15524',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Title Large': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15530',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:4c8854a60d604456fdbafcbe4dffbdafb6bdde12/-1:-1',
            targetVariableName: 'Static/Font/Brand',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15531',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19385',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 22,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15527',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 28,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15529',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15528',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Title Medium': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15532',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15533',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'SemiBold',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19388',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:d2ae886713775052a48c74a12c8ee885a32cc7fb/-1:-1',
            targetVariableName: 'Static/Weight/Bold',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 16,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15534',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 24,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15536',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.15000000596046448,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15535',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Title Small': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15537',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15538',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'SemiBold',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19392',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:d2ae886713775052a48c74a12c8ee885a32cc7fb/-1:-1',
            targetVariableName: 'Static/Weight/Bold',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 14,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15539',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 20,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15541',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.10000000149011612,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15540',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Label Large': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15542',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15543',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'SemiBold',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15584',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:d2ae886713775052a48c74a12c8ee885a32cc7fb/-1:-1',
            targetVariableName: 'Static/Weight/Bold',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 14,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15544',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 20,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15546',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.10000000149011612,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15545',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Label Medium': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15547',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15548',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'SemiBold',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15585',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:d2ae886713775052a48c74a12c8ee885a32cc7fb/-1:-1',
            targetVariableName: 'Static/Weight/Bold',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 12,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15549',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 16,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15551',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.5,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15550',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Label Small': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15552',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15553',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'SemiBold',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19398',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:d2ae886713775052a48c74a12c8ee885a32cc7fb/-1:-1',
            targetVariableName: 'Static/Weight/Bold',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 11,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15554',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 16,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15556',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.5,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15555',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Body Large': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15569',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15570',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19401',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 16,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15571',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 24,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15573',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.5,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15572',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Body Medium': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15574',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15575',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19404',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 14,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15576',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 20,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15578',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.25,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15577',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
    'Body Small': {
      'Font': {
        $type: 'string',
        $value: 'Roboto',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15579',
          'com.figma.scopes': ['FONT_FAMILY'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:067cedf890f7b396bc0b806155b6557fe36c3266/-1:-1',
            targetVariableName: 'Static/Font/Plain',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight': {
        $type: 'string',
        $value: 'Regular',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:55064:15580',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:ced4b6e0101429362daf5f3e8876aa0659a7fe28/-1:-1',
            targetVariableName: 'Static/Weight/Regular',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Weight-emphasized': {
        $type: 'string',
        $value: 'Medium',
        $extensions: {
          'com.figma.type': 'string',
          'com.figma.variableId': 'VariableID:58148:19407',
          'com.figma.scopes': ['FONT_STYLE'],
          'com.figma.aliasData': {
            targetVariableId:
              'VariableID:b4b87131a0723768e3bfc3a401fc144f7abed61b/-1:-1',
            targetVariableName: 'Static/Weight/Medium',
            targetVariableSetId:
              'VariableCollectionId:4fa72a58de56de3aa29ce76b6df9a3fac2b69f58/-1:-1',
            targetVariableSetName: 'Font theme',
          },
        },
      },
      'Size': {
        $type: 'number',
        $value: 12,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15581',
          'com.figma.scopes': ['FONT_SIZE'],
        },
      },
      'Line Height': {
        $type: 'number',
        $value: 16,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15583',
          'com.figma.scopes': ['LINE_HEIGHT'],
        },
      },
      'Tracking': {
        $type: 'number',
        $value: 0.4000000059604645,
        $extensions: {
          'com.figma.variableId': 'VariableID:55064:15582',
          'com.figma.scopes': ['LETTER_SPACING'],
        },
      },
    },
  },
  $extensions: {
    'com.figma.modeName': 'Baseline',
  },
};

const processed = {
  typography: {},
};

Object.keys(typographyTokens['Static']).forEach(token => {
  const tokenName = kebabCase(token.replaceAll(' ', ''));
  processed.typography[tokenName] = {
    fontFamily: {
      $type: 'fontFamily',
      $value: '{font-family-sans}',
    },
    fontWeight: {
      $type: 'fontWeight',
      $value:
        '{font-weight.' +
        kebabCase(
          typographyTokens['Static'][token]['Weight'].$value.replaceAll(
            ' ',
            '',
          ),
        ) +
        '}',
    },
    fontSize: {
      $type: 'dimension',
      $value: typographyTokens['Static'][token]['Size'].$value / 16 + 'rem',
    },
    lineHeight: {
      $type: 'dimension',
      $value:
        typographyTokens['Static'][token]['Line Height'].$value / 16 + 'rem',
    },
    letterSpacing: {
      $type: 'dimension',
      $value: typographyTokens['Static'][token]['Tracking'].$value + 'px',
    },
  };
  processed.typography[tokenName + '-emphasized'] = {
    fontFamily: {
      $type: 'fontFamily',
      $value: '{font-family-sans}',
    },
    fontWeight: {
      $type: 'fontWeight',
      $value:
        '{font-weight.' +
        kebabCase(
          typographyTokens['Static'][token][
            'Weight-emphasized'
          ].$value.replaceAll(' ', ''),
        ) +
        '}',
    },
    fontSize: {
      $type: 'dimension',
      $value: typographyTokens['Static'][token]['Size'].$value / 16 + 'rem',
    },
    lineHeight: {
      $type: 'dimension',
      $value:
        typographyTokens['Static'][token]['Line Height'].$value / 16 + 'rem',
    },
    letterSpacing: {
      $type: 'dimension',
      $value: typographyTokens['Static'][token]['Tracking'].$value + 'px',
    },
  };
});

console.log(JSON.stringify(processed, null, 2));
