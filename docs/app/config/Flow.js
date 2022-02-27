import { Md } from '../components/Md';

import node from './Node';

export default {
   ...node,
   gap: {
      type: 'number',
      key: true,
      description: (
         <cx>
            <Md>Inner distance between the child cells.</Md>
         </cx>
      ),
   },
   direction: {
      type: 'string',
      key: true,
      description: (
         <cx>
            <Md>Available directions are `left`, `right`, 'up' and `down`. Default value is `right`.</Md>
         </cx>
      ),
   },
   padding: {
      type: 'number',
      alias: 'p',
      description: (
         <cx>
            <Md>Padding.</Md>
         </cx>
      ),
   },
   pl: {
      type: 'number',
      description: (
         <cx>
            <Md>Left padding.</Md>
         </cx>
      ),
   },
   px: {
      type: 'number',
      description: (
         <cx>
            <Md>Horizontal padding.</Md>
         </cx>
      ),
   },
   py: {
      type: 'number',
      description: (
         <cx>
            <Md>Vertical padding.</Md>
         </cx>
      ),
   },
   pr: {
      type: 'number',
      description: (
         <cx>
            <Md>Right padding.</Md>
         </cx>
      ),
   },
   pt: {
      type: 'number',
      description: (
         <cx>
            <Md>Top padding.</Md>
         </cx>
      ),
   },
   pb: {
      type: 'number',
      description: (
         <cx>
            <Md>Bottom padding.</Md>
         </cx>
      ),
   },
};
