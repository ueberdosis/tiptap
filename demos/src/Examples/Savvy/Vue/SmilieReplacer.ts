import { Extension, textInputRule } from '@tiptap/core'

export const SmilieReplacer = Extension.create({
  name: 'smilieReplacer',

  addInputRules() {
    return [
      new textInputRule({ find: /-___- $/, replace: '😑 ' }),
      new textInputRule({ find: /:'-\) $/, replace: '😂 ' }),
      new textInputRule({ find: /':-\) $/, replace: '😅 ' }),
      new textInputRule({ find: /':-D $/, replace: '😅 ' }),
      new textInputRule({ find: />:-\) $/, replace: '😆 ' }),
      new textInputRule({ find: /-__- $/, replace: '😑 ' }),
      new textInputRule({ find: /':-\( $/, replace: '😓 ' }),
      new textInputRule({ find: /:'-\( $/, replace: '😢 ' }),
      new textInputRule({ find: />:-\( $/, replace: '😠 ' }),
      new textInputRule({ find: /O:-\) $/, replace: '😇 ' }),
      new textInputRule({ find: /0:-3 $/, replace: '😇 ' }),
      new textInputRule({ find: /0:-\) $/, replace: '😇 ' }),
      new textInputRule({ find: /0;\^\) $/, replace: '😇 ' }),
      new textInputRule({ find: /O;-\) $/, replace: '😇 ' }),
      new textInputRule({ find: /0;-\) $/, replace: '😇 ' }),
      new textInputRule({ find: /O:-3 $/, replace: '😇 ' }),
      new textInputRule({ find: /:'\) $/, replace: '😂 ' }),
      new textInputRule({ find: /:-D $/, replace: '😃 ' }),
      new textInputRule({ find: /':\) $/, replace: '😅 ' }),
      new textInputRule({ find: /'=\) $/, replace: '😅 ' }),
      new textInputRule({ find: /':D $/, replace: '😅 ' }),
      new textInputRule({ find: /'=D $/, replace: '😅 ' }),
      new textInputRule({ find: />:\) $/, replace: '😆 ' }),
      new textInputRule({ find: />;\) $/, replace: '😆 ' }),
      new textInputRule({ find: />=\) $/, replace: '😆 ' }),
      new textInputRule({ find: /;-\) $/, replace: '😉 ' }),
      new textInputRule({ find: /\*-\) $/, replace: '😉 ' }),
      new textInputRule({ find: /;-\] $/, replace: '😉 ' }),
      new textInputRule({ find: /;\^\) $/, replace: '😉 ' }),
      new textInputRule({ find: /B-\) $/, replace: '😎 ' }),
      new textInputRule({ find: /8-\) $/, replace: '😎 ' }),
      new textInputRule({ find: /B-D $/, replace: '😎 ' }),
      new textInputRule({ find: /8-D $/, replace: '😎 ' }),
      new textInputRule({ find: /:-\* $/, replace: '😘 ' }),
      new textInputRule({ find: /:\^\* $/, replace: '😘 ' }),
      new textInputRule({ find: /:-\) $/, replace: '🙂 ' }),
      new textInputRule({ find: /-_- $/, replace: '😑 ' }),
      new textInputRule({ find: /:-X $/, replace: '😶 ' }),
      new textInputRule({ find: /:-# $/, replace: '😶 ' }),
      new textInputRule({ find: /:-x $/, replace: '😶 ' }),
      new textInputRule({ find: />.< $/, replace: '😣 ' }),
      new textInputRule({ find: /:-O $/, replace: '😮 ' }),
      new textInputRule({ find: /:-o $/, replace: '😮 ' }),
      new textInputRule({ find: /O_O $/, replace: '😮 ' }),
      new textInputRule({ find: />:O $/, replace: '😮 ' }),
      new textInputRule({ find: /:-P $/, replace: '😛 ' }),
      new textInputRule({ find: /:-p $/, replace: '😛 ' }),
      new textInputRule({ find: /:-Þ $/, replace: '😛 ' }),
      new textInputRule({ find: /:-þ $/, replace: '😛 ' }),
      new textInputRule({ find: /:-b $/, replace: '😛 ' }),
      new textInputRule({ find: />:P $/, replace: '😜 ' }),
      new textInputRule({ find: /X-P $/, replace: '😜 ' }),
      new textInputRule({ find: /x-p $/, replace: '😜 ' }),
      new textInputRule({ find: /':\( $/, replace: '😓 ' }),
      new textInputRule({ find: /'=\( $/, replace: '😓 ' }),
      new textInputRule({ find: />:\\ $/, replace: '😕 ' }),
      new textInputRule({ find: />:\/ $/, replace: '😕 ' }),
      new textInputRule({ find: /:-\/ $/, replace: '😕 ' }),
      new textInputRule({ find: /:-. $/, replace: '😕 ' }),
      new textInputRule({ find: />:\[ $/, replace: '😞 ' }),
      new textInputRule({ find: /:-\( $/, replace: '😞 ' }),
      new textInputRule({ find: /:-\[ $/, replace: '😞 ' }),
      new textInputRule({ find: /:'\( $/, replace: '😢 ' }),
      new textInputRule({ find: /;-\( $/, replace: '😢 ' }),
      new textInputRule({ find: /#-\) $/, replace: '😵 ' }),
      new textInputRule({ find: /%-\) $/, replace: '😵 ' }),
      new textInputRule({ find: /X-\) $/, replace: '😵 ' }),
      new textInputRule({ find: />:\( $/, replace: '😠 ' }),
      new textInputRule({ find: /0:3 $/, replace: '😇 ' }),
      new textInputRule({ find: /0:\) $/, replace: '😇 ' }),
      new textInputRule({ find: /O:\) $/, replace: '😇 ' }),
      new textInputRule({ find: /O=\) $/, replace: '😇 ' }),
      new textInputRule({ find: /O:3 $/, replace: '😇 ' }),
      new textInputRule({ find: /<\/3 $/, replace: '💔 ' }),
      new textInputRule({ find: /:D $/, replace: '😃 ' }),
      new textInputRule({ find: /=D $/, replace: '😃 ' }),
      new textInputRule({ find: /;\) $/, replace: '😉 ' }),
      new textInputRule({ find: /\*\) $/, replace: '😉 ' }),
      new textInputRule({ find: /;\] $/, replace: '😉 ' }),
      new textInputRule({ find: /;D $/, replace: '😉 ' }),
      new textInputRule({ find: /B\) $/, replace: '😎 ' }),
      new textInputRule({ find: /8\) $/, replace: '😎 ' }),
      new textInputRule({ find: /:\* $/, replace: '😘 ' }),
      new textInputRule({ find: /=\* $/, replace: '😘 ' }),
      new textInputRule({ find: /:\) $/, replace: '🙂 ' }),
      new textInputRule({ find: /=\] $/, replace: '🙂 ' }),
      new textInputRule({ find: /=\) $/, replace: '🙂 ' }),
      new textInputRule({ find: /:\] $/, replace: '🙂 ' }),
      new textInputRule({ find: /:X $/, replace: '😶 ' }),
      new textInputRule({ find: /:# $/, replace: '😶 ' }),
      new textInputRule({ find: /=X $/, replace: '😶 ' }),
      new textInputRule({ find: /=x $/, replace: '😶 ' }),
      new textInputRule({ find: /:x $/, replace: '😶 ' }),
      new textInputRule({ find: /=# $/, replace: '😶 ' }),
      new textInputRule({ find: /:O $/, replace: '😮 ' }),
      new textInputRule({ find: /:o $/, replace: '😮 ' }),
      new textInputRule({ find: /:P $/, replace: '😛 ' }),
      new textInputRule({ find: /=P $/, replace: '😛 ' }),
      new textInputRule({ find: /:p $/, replace: '😛  ' }),
      new textInputRule({ find: /=p $/, replace: '😛 ' }),
      new textInputRule({ find: /:Þ $/, replace: '😛 ' }),
      new textInputRule({ find: /:þ $/, replace: '😛 ' }),
      new textInputRule({ find: /:b $/, replace: '😛 ' }),
      new textInputRule({ find: /d: $/, replace: '😛 ' }),
      new textInputRule({ find: /:\/ $/, replace: '😕 ' }),
      new textInputRule({ find: /:\\ $/, replace: '😕 ' }),
      new textInputRule({ find: /=\/ $/, replace: '😕 ' }),
      new textInputRule({ find: /=\\ $/, replace: '😕 ' }),
      new textInputRule({ find: /:L $/, replace: '😕 ' }),
      new textInputRule({ find: /=L $/, replace: '😕 ' }),
      new textInputRule({ find: /:\( $/, replace: '😞 ' }),
      new textInputRule({ find: /:\[ $/, replace: '😞 ' }),
      new textInputRule({ find: /=\( $/, replace: '😞 ' }),
      new textInputRule({ find: /;\( $/, replace: '😢 ' }),
      new textInputRule({ find: /D: $/, replace: '😨 ' }),
      new textInputRule({ find: /:\$ $/, replace: '😳 ' }),
      new textInputRule({ find: /=\$ $/, replace: '😳 ' }),
      new textInputRule({ find: /#\) $/, replace: '😵 ' }),
      new textInputRule({ find: /%\) $/, replace: '😵 ' }),
      new textInputRule({ find: /X\) $/, replace: '😵 ' }),
      new textInputRule({ find: /:@ $/, replace: '😠 ' }),
      new textInputRule({ find: /<3 $/, replace: '❤️ ' }),
      new textInputRule({ find: /\/shrug $/, replace: '¯\\_(ツ)_/¯' }),
    ];
  },
})
