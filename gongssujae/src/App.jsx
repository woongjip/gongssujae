{\rtf1\ansi\ansicpg949\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red108\green0\blue181;\red255\green255\blue255;\red16\green19\blue24;
\red32\green36\blue45;\red15\green112\blue1;\red14\green110\blue109;\red162\green55\blue4;\red4\green57\blue181;
\red91\green98\blue116;\red167\green0\blue20;\red173\green0\blue24;}
{\*\expandedcolortbl;;\cssrgb\c50588\c0\c76078;\cssrgb\c100000\c100000\c100000;\cssrgb\c7843\c9412\c12157;
\cssrgb\c16863\c18824\c23137;\cssrgb\c0\c50196\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c70196\c29020\c0;\cssrgb\c0\c31765\c76078;
\cssrgb\c43137\c46275\c52941;\cssrgb\c72157\c3922\c9412;\cssrgb\c74118\c5882\c11765;}
\paperw11900\paperh16840\margl1440\margr1440\vieww17420\viewh15340\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
import \{ useState, useMemo \} from "react";\
\
import\cf4  \cf5 \{\cf4  useState\cf5 ,\cf4  useMemo \cf5 \}\cf4  \cf2 from\cf4  \cf6 "react"\cf5 ;\cf4 \
\
\cf2 const\cf4  \cf7 ACCENT\cf4  = \cf6 "#2D6A4F"\cf5 ;\cf4 \
\cf2 const\cf4  \cf7 ACCENT_LIGHT\cf4  = \cf6 "#f0f7f4"\cf5 ;\cf4 \
\cf2 const\cf4  \cf7 ACCENT_MID\cf4  = \cf6 "#52b788"\cf5 ;\cf4 \
\
\cf2 const\cf4  sampleItems = \cf5 [\cf4 \
  \cf5 \{\cf4  id: \cf7 1\cf5 ,\cf4  title: \cf6 "\uc0\u48744 \u44036  \u46300 \u47112 \u49828  (2\u48268 )"\cf5 ,\cf4  category: \cf6 "\uc0\u51032 \u49345 "\cf5 ,\cf4  show: \cf6 "\uc0\u45908  \u54764 \u47532 \u53093 \u53552 \u49660  2024"\cf5 ,\cf4  price: \cf7 0\cf5 ,\cf4  image: \cf6 "\uc0\u55356 \u57261 "\cf5 ,\cf4  desc: \cf6 "\uc0\u44277 \u50672  \u51333 \u47308  \u54980  \u45224 \u51008  \u48744 \u44036  \u46300 \u47112 \u49828  2\u48268 . \u49324 \u51060 \u51592  S/M. \u49464 \u53441  \u50756 \u47308 ."\cf5 ,\cf4  seller: \cf6 "\uc0\u44537 \u45800  \u54028 \u46020 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u54028 "\cf5 ,\cf4  likes: \cf7 12\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 2\cf5 ,\cf4  title: \cf6 "\uc0\u49548 \u54805  \u49828 \u54047  \u51312 \u47749  x3"\cf5 ,\cf4  category: \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  show: \cf6 "\uc0\u45804 \u48731  \u49548 \u45208 \u53440  \u51204 \u49884 "\cf5 ,\cf4  price: \cf7 15000\cf5 ,\cf4  image: \cf6 "\uc0\u55357 \u56481 "\cf5 ,\cf4  desc: \cf6 "\uc0\u51204 \u49884  \u52384 \u49688  \u54980  \u45224 \u51008  LED \u49828 \u54047  \u51312 \u47749  3\u44060 . \u49345 \u53468  \u50577 \u54840 ."\cf5 ,\cf4  seller: \cf6 "\uc0\u50500 \u53944 \u49828 \u54168 \u51060 \u49828  \u51012 \u51648 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u51012 "\cf5 ,\cf4  likes: \cf7 8\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 3\cf5 ,\cf4  title: \cf6 "\uc0\u45208 \u47924  \u51032 \u51088  \u49464 \u53944  (6\u44060 )"\cf5 ,\cf4  category: \cf6 "\uc0\u49464 \u53944 "\cf5 ,\cf4  show: \cf6 "\uc0\u49884 \u44036 \u51032  \u48169  \u50672 \u44537 \u51228 "\cf5 ,\cf4  price: \cf7 0\cf5 ,\cf4  image: \cf6 "\uc0\u55358 \u56977 "\cf5 ,\cf4  desc: \cf6 "\uc0\u47924 \u45824  \u49548 \u54408 \u50857  \u45208 \u47924  \u51032 \u51088  6\u44060 . \u54589 \u50629  \u44032 \u45733  \u51648 \u50669 : \u45824 \u54617 \u47196 ."\cf5 ,\cf4  seller: \cf6 "\uc0\u44537 \u45800  \u49714 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u49714 "\cf5 ,\cf4  likes: \cf7 21\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 4\cf5 ,\cf4  title: \cf6 "\uc0\u54620 \u48373  \u52824 \u47560  (\u50672 \u46160 \u49353 )"\cf5 ,\cf4  category: \cf6 "\uc0\u51032 \u49345 "\cf5 ,\cf4  show: \cf6 "\uc0\u52632 \u54693  \u47532 \u48121 \u49828 "\cf5 ,\cf4  price: \cf7 8000\cf5 ,\cf4  image: \cf6 "\uc0\u55357 \u56407 "\cf5 ,\cf4  desc: \cf6 "\uc0\u54620 \u48373  \u51089 \u50629  \u54980  \u45224 \u51008  \u52824 \u47560  1\u51216 . \u54728 \u47532  60cm. \u49345 \u53468  \u52572 \u49345 ."\cf5 ,\cf4  seller: \cf6 "\uc0\u47924 \u50857 \u45800  \u48388 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u48388 "\cf5 ,\cf4  likes: \cf7 5\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 5\cf5 ,\cf4  title: \cf6 "\uc0\u45824 \u54805  \u54788 \u49688 \u47561  \u52380  (3m\'d75m)"\cf5 ,\cf4  category: \cf6 "\uc0\u44592 \u53440 "\cf5 ,\cf4  show: \cf6 "\uc0\u51064 \u46356 \u48036 \u51649 \u50948 \u53356  2024"\cf5 ,\cf4  price: \cf7 0\cf5 ,\cf4  image: \cf6 "\uc0\u55356 \u57326 "\cf5 ,\cf4  desc: \cf6 "\uc0\u54665 \u49324  \u54980  \u45224 \u51008  \u45824 \u54805  \u52380  \u49548 \u51116  \u54788 \u49688 \u47561 . DIY \u48176 \u44221 \u51004 \u47196  \u51339 \u50500 \u50836 ."\cf5 ,\cf4  seller: \cf6 "\uc0\u47928 \u54868 \u44277 \u44036  \u45432 \u46308 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u45432 "\cf5 ,\cf4  likes: \cf7 3\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 6\cf5 ,\cf4  title: \cf6 "\uc0\u48516 \u51109  \u49548 \u54408  \u49464 \u53944 "\cf5 ,\cf4  category: \cf6 "\uc0\u49548 \u54408 "\cf5 ,\cf4  show: \cf6 "\uc0\u54624 \u47196 \u50952  \u54140 \u54252 \u47676 \u49828 "\cf5 ,\cf4  price: \cf7 5000\cf5 ,\cf4  image: \cf6 "\uc0\u55356 \u57256 "\cf5 ,\cf4  desc: \cf6 "\uc0\u48516 \u51109 \u50857  \u50753 \u49828 , \u53356 \u47112 \u50857 , \u44032 \u48156  \u54252 \u54632 . \u45824 \u48512 \u48516  \u48120 \u44060 \u48393 ."\cf5 ,\cf4  seller: \cf6 "\uc0\u44537 \u45800  \u54028 \u46020 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u54028 "\cf5 ,\cf4  likes: \cf7 17\cf4  \cf5 \},\cf4 \
\cf5 ];\cf4 \
\
\cf2 const\cf4  sampleJobs = \cf5 [\cf4 \
  \cf5 \{\cf4  id: \cf7 101\cf5 ,\cf4  title: \cf6 "\uc0\u51312 \u47749  \u46356 \u51088 \u51060 \u45320  \u44396 \u54633 \u45768 \u45796 "\cf5 ,\cf4  field: \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  org: \cf6 "\uc0\u44537 \u45800  \u54028 \u46020 "\cf5 ,\cf4  pay: \cf6 "\uc0\u54801 \u51032 "\cf5 ,\cf4  date: \cf6 "2025.06.14~06.28"\cf5 ,\cf4  desc: \cf6 "\uc0\u49548 \u44537 \u51109  \u50672 \u44537  \u51312 \u47749  \u49444 \u44228  \u48143  \u54788 \u51109  \u50868 \u50689 . \u44221 \u47141  2\u45380  \u51060 \u49345  \u50864 \u45824 ."\cf5 ,\cf4  \cf8 location\cf4 : \cf6 "\uc0\u45824 \u54617 \u47196 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55357 \u56481 "\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 102\cf5 ,\cf4  title: \cf6 "\uc0\u47924 \u45824  \u49464 \u53944  \u51228 \u51089  \u49828 \u53468 \u54532 "\cf5 ,\cf4  field: \cf6 "\uc0\u47924 \u45824 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  org: \cf6 "\uc0\u50500 \u53944 \u49828 \u54168 \u51060 \u49828  \u51012 \u51648 "\cf5 ,\cf4  pay: \cf6 "\uc0\u51068  80,000\u50896 "\cf5 ,\cf4  date: \cf6 "2025.06.10~06.13"\cf5 ,\cf4  desc: \cf6 "\uc0\u51204 \u49884  \u50724 \u54536  \u51204  \u49464 \u53944  \u49444 \u52824  \u48143  \u52384 \u49688  \u48372 \u51312  \u49828 \u53468 \u54532 \u47484  \u47784 \u51665 \u54633 \u45768 \u45796 ."\cf5 ,\cf4  \cf8 location\cf4 : \cf6 "\uc0\u51012 \u51648 \u47196 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55356 \u57303 \u65039 "\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 103\cf5 ,\cf4  title: \cf6 "\uc0\u51020 \u54693  \u50644 \u51648 \u45768 \u50612  (\u49345 \u51452 )"\cf5 ,\cf4  field: \cf6 "\uc0\u51020 \u54693 "\cf5 ,\cf4  type: \cf6 "\uc0\u51109 \u44592 "\cf5 ,\cf4  org: \cf6 "\uc0\u47928 \u54868 \u44277 \u44036  \u45432 \u46308 "\cf5 ,\cf4  pay: \cf6 "\uc0\u50900  230\u47564 \u50896 ~"\cf5 ,\cf4  date: \cf6 "2025.07.01~"\cf5 ,\cf4  desc: \cf6 "\uc0\u44277 \u50672 \u51109  \u49345 \u51452  \u51020 \u54693  \u50644 \u51648 \u45768 \u50612 . \u53080 \u49556  \u50868 \u50857  \u44221 \u54744  \u54596 \u49688 ."\cf5 ,\cf4  \cf8 location\cf4 : \cf6 "\uc0\u45432 \u46308 \u49452 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55356 \u57255 "\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 104\cf5 ,\cf4  title: \cf6 "\uc0\u48516 \u51109  \u50500 \u54000 \u49828 \u53944  \u49453 \u50808 "\cf5 ,\cf4  field: \cf6 "\uc0\u48516 \u51109 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  org: \cf6 "\uc0\u47924 \u50857 \u45800  \u48388 "\cf5 ,\cf4  pay: \cf6 "\uc0\u54924 \u45817  150,000\u50896 "\cf5 ,\cf4  date: \cf6 "2025.06.20~06.22"\cf5 ,\cf4  desc: \cf6 "\uc0\u54788 \u45824 \u47924 \u50857  \u44277 \u50672  \u48516 \u51109 . \u54140 \u54252 \u47672  8\u47749 . \u44221 \u47141 \u51088  \u50864 \u45824 ."\cf5 ,\cf4  \cf8 location\cf4 : \cf6 "\uc0\u47560 \u54252 \u44396 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55357 \u56452 "\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 105\cf5 ,\cf4  title: \cf6 "\uc0\u47924 \u45824  \u44048 \u46021  \u50612 \u49884 \u49828 \u53556 \u53944 "\cf5 ,\cf4  field: \cf6 "\uc0\u47924 \u45824 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  org: \cf6 "\uc0\u44537 \u45800  \u49714 "\cf5 ,\cf4  pay: \cf6 "\uc0\u54801 \u51032 "\cf5 ,\cf4  date: \cf6 "2025.07.05~07.20"\cf5 ,\cf4  desc: \cf6 "\uc0\u50672 \u44537  \u44277 \u50672  \u47924 \u45824  \u44048 \u46021  \u50612 \u49884 \u49828 \u53556 \u53944 . \u51204 \u48152 \u51201 \u51064  \u44277 \u50672  \u50868 \u50689  \u48372 \u51312 ."\cf5 ,\cf4  \cf8 location\cf4 : \cf6 "\uc0\u45824 \u54617 \u47196 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55356 \u57260 "\cf4  \cf5 \},\cf4 \
  \cf5 \{\cf4  id: \cf7 106\cf5 ,\cf4  title: \cf6 "\uc0\u50689 \u49345  VJ (\u46972 \u51060 \u48652 )"\cf5 ,\cf4  field: \cf6 "\uc0\u50689 \u49345 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  org: \cf6 "\uc0\u51064 \u46356 \u48036 \u51649 \u50948 \u53356 "\cf5 ,\cf4  pay: \cf6 "\uc0\u51068  100,000\u50896 "\cf5 ,\cf4  date: \cf6 "2025.08.01~08.03"\cf5 ,\cf4  desc: \cf6 "\uc0\u50556 \u50808  \u51020 \u50501  \u54168 \u49828 \u54000 \u48268  \u49892 \u49884 \u44036  \u50689 \u49345  \u49569 \u52636  \u48143  \u48121 \u49905  \u45812 \u45817 ."\cf5 ,\cf4  \cf8 location\cf4 : \cf6 "\uc0\u54620 \u44053 \u44277 \u50896 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55357 \u56569 "\cf4  \cf5 \},\cf4 \
\cf5 ];\cf4 \
\
\cf2 const\cf4  \cf7 ITEM_CATS\cf4  = \cf5 [\cf6 "\uc0\u51204 \u52404 "\cf5 ,\cf4  \cf6 "\uc0\u51032 \u49345 "\cf5 ,\cf4  \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  \cf6 "\uc0\u49464 \u53944 "\cf5 ,\cf4  \cf6 "\uc0\u49548 \u54408 "\cf5 ,\cf4  \cf6 "\uc0\u44592 \u53440 "\cf5 ];\cf4 \
\cf2 const\cf4  \cf7 JOB_FIELDS\cf4  = \cf5 [\cf6 "\uc0\u51204 \u52404 "\cf5 ,\cf4  \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  \cf6 "\uc0\u47924 \u45824 "\cf5 ,\cf4  \cf6 "\uc0\u51020 \u54693 "\cf5 ,\cf4  \cf6 "\uc0\u48516 \u51109 "\cf5 ,\cf4  \cf6 "\uc0\u50689 \u49345 "\cf5 ,\cf4  \cf6 "\uc0\u44592 \u53440 "\cf5 ];\cf4 \
\cf2 const\cf4  \cf7 JOB_TYPES\cf4  = \cf5 [\cf6 "\uc0\u51204 \u52404 "\cf5 ,\cf4  \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  \cf6 "\uc0\u51109 \u44592 "\cf5 ];\cf4 \
\
\cf2 const\cf4  sampleChats = \cf5 \{\cf4 \
  \cf7 1\cf4 : \cf5 [\{\cf4  \cf2 from\cf4 : \cf6 "other"\cf5 ,\cf4  text: \cf6 "\uc0\u50504 \u45397 \u54616 \u49464 \u50836 ! \u46300 \u47112 \u49828  \u50500 \u51649  \u45224 \u50500 \u51080 \u45208 \u50836 ?"\cf4  \cf5 \},\cf4  \cf5 \{\cf4  \cf2 from\cf4 : \cf6 "me"\cf5 ,\cf4  text: \cf6 "\uc0\u45348 , \u50500 \u51649  \u51080 \u50612 \u50836 !"\cf4  \cf5 \}],\cf4 \
  \cf7 101\cf4 : \cf5 [\{\cf4  \cf2 from\cf4 : \cf6 "other"\cf5 ,\cf4  text: \cf6 "\uc0\u51312 \u47749  \u46356 \u51088 \u51060 \u45320  \u44277 \u44256  \u44288 \u47144 \u54644 \u49436  \u47928 \u51032 \u46300 \u47140 \u46020  \u46112 \u44620 \u50836 ?"\cf4  \cf5 \}],\cf4 \
\cf5 \};\cf4 \
\
\cf2 export\cf4  \cf2 default\cf4  \cf2 function\cf4  \cf8 App\cf5 ()\cf4  \cf5 \{\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 screen\cf5 ,\cf4  setScreen\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "home"\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 mainTab\cf5 ,\cf4  setMainTab\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "items"\cf5 );\cf4  \cf10 // items | jobs\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 bottomTab\cf5 ,\cf4  setBottomTab\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "home"\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 selectedItem\cf5 ,\cf4  setSelectedItem\cf5 ]\cf4  = \cf9 useState\cf5 (\cf2 null\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 selectedJob\cf5 ,\cf4  setSelectedJob\cf5 ]\cf4  = \cf9 useState\cf5 (\cf2 null\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 activeCat\cf5 ,\cf4  setActiveCat\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "\uc0\u51204 \u52404 "\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 activeField\cf5 ,\cf4  setActiveField\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "\uc0\u51204 \u52404 "\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 activeType\cf5 ,\cf4  setActiveType\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "\uc0\u51204 \u52404 "\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 searchQuery\cf5 ,\cf4  setSearchQuery\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 ""\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 searchFocus\cf5 ,\cf4  setSearchFocus\cf5 ]\cf4  = \cf9 useState\cf5 (\cf7 false\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 chatInput\cf5 ,\cf4  setChatInput\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 ""\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 chats\cf5 ,\cf4  setChats\cf5 ]\cf4  = \cf9 useState\cf5 (\cf4 sampleChats\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 activeChat\cf5 ,\cf4  setActiveChat\cf5 ]\cf4  = \cf9 useState\cf5 (\cf2 null\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 activeChatLabel\cf5 ,\cf4  setActiveChatLabel\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 ""\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 items\cf5 ,\cf4  setItems\cf5 ]\cf4  = \cf9 useState\cf5 (\cf4 sampleItems\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 jobs\cf5 ,\cf4  setJobs\cf5 ]\cf4  = \cf9 useState\cf5 (\cf4 sampleJobs\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 likes\cf5 ,\cf4  setLikes\cf5 ]\cf4  = \cf9 useState\cf5 (\{\});\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 form\cf5 ,\cf4  setForm\cf5 ]\cf4  = \cf9 useState\cf5 (\{\cf4  title: \cf6 ""\cf5 ,\cf4  category: \cf6 "\uc0\u51032 \u49345 "\cf5 ,\cf4  show: \cf6 ""\cf5 ,\cf4  price: \cf6 ""\cf5 ,\cf4  desc: \cf6 ""\cf4  \cf5 \});\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 jobForm\cf5 ,\cf4  setJobForm\cf5 ]\cf4  = \cf9 useState\cf5 (\{\cf4  title: \cf6 ""\cf5 ,\cf4  field: \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  pay: \cf6 ""\cf5 ,\cf4  date: \cf6 ""\cf5 ,\cf4  desc: \cf6 ""\cf5 ,\cf4  \cf8 location\cf4 : \cf6 ""\cf4  \cf5 \});\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 showPosted\cf5 ,\cf4  setShowPosted\cf5 ]\cf4  = \cf9 useState\cf5 (\cf7 false\cf5 );\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 chatList\cf5 ,\cf4  setChatList\cf5 ]\cf4  = \cf9 useState\cf5 ([\{\cf4  id: \cf7 1\cf5 ,\cf4  label: \cf6 "\uc0\u48744 \u44036  \u46300 \u47112 \u49828 "\cf4  \cf5 \},\cf4  \cf5 \{\cf4  id: \cf7 101\cf5 ,\cf4  label: \cf6 "\uc0\u51312 \u47749  \u46356 \u51088 \u51060 \u45320  \u44277 \u44256 "\cf4  \cf5 \}]);\cf4 \
  \cf2 const\cf4  \cf5 [\cf4 postMode\cf5 ,\cf4  setPostMode\cf5 ]\cf4  = \cf9 useState\cf5 (\cf6 "item"\cf5 );\cf4  \cf10 // item | job\cf4 \
\
  \cf2 const\cf4  filteredItems = \cf9 useMemo\cf5 (()\cf4  => \cf5 \{\cf4 \
    \cf2 let\cf4  list = activeCat === \cf6 "\uc0\u51204 \u52404 "\cf4  ? items : items\cf5 .\cf9 filter\cf5 (\cf4 i => i\cf5 .\cf4 category === activeCat\cf5 );\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 searchQuery\cf5 )\cf4  list = list\cf5 .\cf9 filter\cf5 (\cf4 i => i\cf5 .\cf4 title\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 )\cf4  || i\cf5 .\cf4 show\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 )\cf4  || i\cf5 .\cf4 desc\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 ));\cf4 \
    \cf2 return\cf4  list\cf5 ;\cf4 \
  \cf5 \},\cf4  \cf5 [\cf4 items\cf5 ,\cf4  activeCat\cf5 ,\cf4  searchQuery\cf5 ]);\cf4 \
\
  \cf2 const\cf4  filteredJobs = \cf9 useMemo\cf5 (()\cf4  => \cf5 \{\cf4 \
    \cf2 let\cf4  list = jobs\cf5 ;\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 activeField !== \cf6 "\uc0\u51204 \u52404 "\cf5 )\cf4  list = list\cf5 .\cf9 filter\cf5 (\cf4 j => j\cf5 .\cf4 field === activeField\cf5 );\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 activeType !== \cf6 "\uc0\u51204 \u52404 "\cf5 )\cf4  list = list\cf5 .\cf9 filter\cf5 (\cf4 j => j\cf5 .\cf4 type === activeType\cf5 );\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 searchQuery\cf5 )\cf4  list = list\cf5 .\cf9 filter\cf5 (\cf4 j => j\cf5 .\cf4 title\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 )\cf4  || j\cf5 .\cf4 org\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 )\cf4  || j\cf5 .\cf4 desc\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 )\cf4  || j\cf5 .\cf4 field\cf5 .\cf9 includes\cf5 (\cf4 searchQuery\cf5 ));\cf4 \
    \cf2 return\cf4  list\cf5 ;\cf4 \
  \cf5 \},\cf4  \cf5 [\cf4 jobs\cf5 ,\cf4  activeField\cf5 ,\cf4  activeType\cf5 ,\cf4  searchQuery\cf5 ]);\cf4 \
\
  \cf2 const\cf4  allResults = \cf9 useMemo\cf5 (()\cf4  => \cf5 \{\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 !searchQuery\cf5 )\cf4  \cf2 return\cf4  \cf5 [];\cf4 \
    \cf2 return\cf4  \cf5 [\cf4 \
      ...filteredItems\cf5 .\cf9 map\cf5 (\cf4 i => \cf5 (\{\cf4  ...i\cf5 ,\cf4  _kind: \cf6 "item"\cf4  \cf5 \})),\cf4 \
      ...filteredJobs\cf5 .\cf9 map\cf5 (\cf4 j => \cf5 (\{\cf4  ...j\cf5 ,\cf4  _kind: \cf6 "job"\cf4  \cf5 \})),\cf4 \
    \cf5 ];\cf4 \
  \cf5 \},\cf4  \cf5 [\cf4 searchQuery\cf5 ,\cf4  filteredItems\cf5 ,\cf4  filteredJobs\cf5 ]);\cf4 \
\
  \cf2 function\cf4  \cf9 openChat\cf5 (\cf4 id\cf5 ,\cf4  label\cf5 )\cf4  \cf5 \{\cf4 \
    \cf9 setActiveChat\cf5 (\cf4 id\cf5 );\cf4  \cf9 setActiveChatLabel\cf5 (\cf4 label\cf5 );\cf4  \cf9 setScreen\cf5 (\cf6 "chat"\cf5 );\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 !chatList\cf5 .\cf9 find\cf5 (\cf4 c => c\cf5 .\cf4 id === id\cf5 ))\cf4  \cf9 setChatList\cf5 (\cf4 prev => \cf5 [\cf4 ...prev\cf5 ,\cf4  \cf5 \{\cf4  id\cf5 ,\cf4  label \cf5 \}]);\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 !chats\cf5 [\cf4 id\cf5 ])\cf4  \cf9 setChats\cf5 (\cf4 prev => \cf5 (\{\cf4  ...prev\cf5 ,\cf4  \cf5 [\cf4 id\cf5 ]\cf4 : \cf5 []\cf4  \cf5 \}));\cf4 \
  \cf5 \}\cf4 \
\
  \cf2 function\cf4  \cf9 sendMsg\cf5 ()\cf4  \cf5 \{\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 !chatInput\cf5 .\cf9 trim\cf5 ())\cf4  \cf2 return\cf5 ;\cf4 \
    \cf9 setChats\cf5 (\cf4 prev => \cf5 (\{\cf4  ...prev\cf5 ,\cf4  \cf5 [\cf4 activeChat\cf5 ]\cf4 : \cf5 [\cf4 ...\cf5 (\cf4 prev\cf5 [\cf4 activeChat\cf5 ]\cf4  || \cf5 []),\cf4  \cf5 \{\cf4  \cf2 from\cf4 : \cf6 "me"\cf5 ,\cf4  text: chatInput \cf5 \}]\cf4  \cf5 \}));\cf4 \
    \cf9 setChatInput\cf5 (\cf6 ""\cf5 );\cf4 \
  \cf5 \}\cf4 \
\
  \cf2 function\cf4  \cf9 toggleLike\cf5 (\cf4 id\cf5 ,\cf4  e\cf5 )\cf4  \cf5 \{\cf4  e && e\cf5 .\cf9 stopPropagation\cf5 ();\cf4  \cf9 setLikes\cf5 (\cf4 prev => \cf5 (\{\cf4  ...prev\cf5 ,\cf4  \cf5 [\cf4 id\cf5 ]\cf4 : !prev\cf5 [\cf4 id\cf5 ]\cf4  \cf5 \}));\cf4  \cf5 \}\cf4 \
\
  \cf2 function\cf4  \cf9 submitItem\cf5 ()\cf4  \cf5 \{\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 !form\cf5 .\cf4 title || !form\cf5 .\cf4 show\cf5 )\cf4  \cf2 return\cf5 ;\cf4 \
    \cf9 setItems\cf5 (\cf4 prev => \cf5 [\{\cf4  id: \cf8 Date\cf5 .\cf9 now\cf5 (),\cf4  ...form\cf5 ,\cf4  price: form\cf5 .\cf4 price ? \cf9 parseInt\cf5 (\cf4 form\cf5 .\cf4 price\cf5 )\cf4  : \cf7 0\cf5 ,\cf4  image: \cf6 "\uc0\u55357 \u56550 "\cf5 ,\cf4  seller: \cf6 "\uc0\u45208 "\cf5 ,\cf4  sellerInitial: \cf6 "\uc0\u45208 "\cf5 ,\cf4  likes: \cf7 0\cf4  \cf5 \},\cf4  ...prev\cf5 ]);\cf4 \
    \cf9 setForm\cf5 (\{\cf4  title: \cf6 ""\cf5 ,\cf4  category: \cf6 "\uc0\u51032 \u49345 "\cf5 ,\cf4  show: \cf6 ""\cf5 ,\cf4  price: \cf6 ""\cf5 ,\cf4  desc: \cf6 ""\cf4  \cf5 \});\cf4 \
    \cf9 setShowPosted\cf5 (\cf7 true\cf5 );\cf4  \cf9 setTimeout\cf5 (()\cf4  => \cf5 \{\cf4  \cf9 setShowPosted\cf5 (\cf7 false\cf5 );\cf4  \cf9 setBottomTab\cf5 (\cf6 "home"\cf5 );\cf4  \cf9 setScreen\cf5 (\cf6 "home"\cf5 );\cf4  \cf9 setMainTab\cf5 (\cf6 "items"\cf5 );\cf4  \cf5 \},\cf4  \cf7 1200\cf5 );\cf4 \
  \cf5 \}\cf4 \
\
  \cf2 function\cf4  \cf9 submitJob\cf5 ()\cf4  \cf5 \{\cf4 \
    \cf2 if\cf4  \cf5 (\cf4 !jobForm\cf5 .\cf4 title || !jobForm\cf5 .\cf4 field\cf5 )\cf4  \cf2 return\cf5 ;\cf4 \
    \cf9 setJobs\cf5 (\cf4 prev => \cf5 [\{\cf4  id: \cf8 Date\cf5 .\cf9 now\cf5 (),\cf4  ...jobForm\cf5 ,\cf4  org: \cf6 "\uc0\u45208 "\cf5 ,\cf4  icon: \cf6 "\uc0\u55357 \u56523 "\cf4  \cf5 \},\cf4  ...prev\cf5 ]);\cf4 \
    \cf9 setJobForm\cf5 (\{\cf4  title: \cf6 ""\cf5 ,\cf4  field: \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  type: \cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  pay: \cf6 ""\cf5 ,\cf4  date: \cf6 ""\cf5 ,\cf4  desc: \cf6 ""\cf5 ,\cf4  \cf8 location\cf4 : \cf6 ""\cf4  \cf5 \});\cf4 \
    \cf9 setShowPosted\cf5 (\cf7 true\cf5 );\cf4  \cf9 setTimeout\cf5 (()\cf4  => \cf5 \{\cf4  \cf9 setShowPosted\cf5 (\cf7 false\cf5 );\cf4  \cf9 setBottomTab\cf5 (\cf6 "home"\cf5 );\cf4  \cf9 setScreen\cf5 (\cf6 "home"\cf5 );\cf4  \cf9 setMainTab\cf5 (\cf6 "jobs"\cf5 );\cf4  \cf5 \},\cf4  \cf7 1200\cf5 );\cf4 \
  \cf5 \}\cf4 \
\
  \cf2 const\cf4  \cf9 tabBtn\cf4  = \cf5 (\cf4 t\cf5 )\cf4  => \cf5 (\{\cf4 \
    flex: \cf7 1\cf5 ,\cf4  display: \cf6 "flex"\cf5 ,\cf4  flexDirection: \cf6 "column"\cf5 ,\cf4  alignItems: \cf6 "center"\cf5 ,\cf4 \
    gap: \cf7 2\cf5 ,\cf4  padding: \cf6 "8px 0"\cf5 ,\cf4  cursor: \cf6 "pointer"\cf5 ,\cf4  fontSize: \cf7 11\cf5 ,\cf4 \
    color: bottomTab === t ? \cf7 ACCENT\cf4  : \cf6 "#aaa"\cf5 ,\cf4  fontWeight: bottomTab === t ? \cf7 500\cf4  : \cf7 400\cf5 ,\cf4  border: \cf6 "none"\cf5 ,\cf4  background: \cf6 "none"\cf4 \
  \cf5 \});\cf4 \
  \cf2 const\cf4  \cf9 tabIcon\cf4  = \cf5 (\cf4 t\cf5 )\cf4  => \cf5 (\{\cf4  fontSize: \cf7 22\cf5 ,\cf4  color: bottomTab === t ? \cf7 ACCENT\cf4  : \cf6 "#bbb"\cf4  \cf5 \});\cf4 \
\
  \cf2 const\cf4  \cf9 filterChip\cf4  = \cf5 (\cf4 label\cf5 ,\cf4  active\cf5 ,\cf4  onClick\cf5 )\cf4  => \cf5 (\cf4 \
    \cf5 <\cf11 button \cf12 key\cf11 =\cf5 \{\cf11 label\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{\cf11 onClick\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11 \
      flexShrink\cf4 :\cf11  \cf7 0\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "5px 12px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 20\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid"\cf5 ,\cf11 \
      borderColor\cf4 :\cf11  active \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#e0e0e0"\cf5 ,\cf11  background\cf4 :\cf11  active \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11 \
      color\cf4 :\cf11  active \cf4 ?\cf11  \cf6 "#fff"\cf11  \cf4 :\cf11  \cf6 "#555"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  fontWeight\cf4 :\cf11  active \cf4 ?\cf11  \cf7 500\cf11  \cf4 :\cf11  \cf7 400\cf11 \
    \cf5 \}\}>\{\cf4 label\cf5 \}</\cf11 button\cf5 >\cf4 \
  \cf5 );\cf4 \
\
  \cf2 const\cf4  \cf9 typeBadge\cf4  = \cf5 (\cf4 type\cf5 )\cf4  => \cf5 (\cf4 \
    \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 10\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "2px 8px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf5 ,\cf11  background\cf4 :\cf11  type \cf4 ===\cf11  \cf6 "\uc0\u51109 \u44592 "\cf11  \cf4 ?\cf11  \cf6 "#e8f4fd"\cf11  \cf4 :\cf11  \cf6 "#fff3e0"\cf5 ,\cf11  color\cf4 :\cf11  type \cf4 ===\cf11  \cf6 "\uc0\u51109 \u44592 "\cf11  \cf4 ?\cf11  \cf6 "#1565c0"\cf11  \cf4 :\cf11  \cf6 "#e65100"\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 type\cf5 \}</\cf11 span\cf5 >\cf4 \
  \cf5 );\cf4 \
\
  \cf2 return\cf4  \cf5 (\cf4 \
    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  maxWidth\cf4 :\cf11  \cf7 390\cf5 ,\cf11  margin\cf4 :\cf11  \cf6 "0 auto"\cf5 ,\cf11  fontFamily\cf4 :\cf11  \cf6 "sans-serif"\cf5 ,\cf11  position\cf4 :\cf11  \cf6 "relative"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "1px solid #e5e5e5"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 24\cf5 ,\cf11  overflow\cf4 :\cf11  \cf6 "hidden"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  minHeight\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
\
      \cf5 \{\cf10 /* HOME */\cf5 \}\cf4 \
      \cf5 \{\cf4 screen === \cf6 "home"\cf4  && \cf5 (\cf4 \
        \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
          \cf5 \{\cf10 /* Header */\cf5 \}\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "18px 16px 0"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "space-between"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 12\cf11  \cf5 \}\}>\cf4 \
              \cf5 <\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 20\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  color\cf4 :\cf11  \cf7 ACCENT\cf11  \cf5 \}\}>\cf4 \uc0\u44277 \u50416 \u51116 \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#999"\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 1\cf11  \cf5 \}\}>\cf4 \uc0\u44277 \u50672 \u50640  \u50416 \u44256  \u45224 \u51008  \u47932 \u44148 \u44284  \u51068 \u51088 \u47532 \u47484  \u45208 \u45589 \u45768 \u45796 \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 <\cf11 button \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#888"\cf11  \cf5 \}\}>\cf4 <i className="ti ti-bell" />\cf5 </\cf11 button\cf5 >\cf4 \
            \cf5 </\cf11 div\cf5 >\cf4 \
\
            \cf5 \{\cf10 /* Search bar */\cf5 \}\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#f5f5f5"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "9px 12px"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 12\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf11  \cf5 \}\}>\cf4 \
              \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-search\cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 16\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#aaa"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
              \cf5 <\cf11 input \cf12 value\cf11 =\cf5 \{\cf11 searchQuery\cf5 \}\cf11  \cf12 onChange\cf11 =\cf5 \{\cf11 e => \cf9 setSearchQuery\cf5 (\cf11 e\cf5 .\cf11 target\cf5 .\cf11 value\cf5 )\}\cf11 \
                \cf12 onFocus\cf11 =\cf5 \{()\cf11  => \cf9 setSearchFocus\cf5 (\cf7 true\cf5 )\}\cf11  \cf12 onBlur\cf11 =\cf5 \{()\cf11  => \cf9 setTimeout\cf5 (()\cf11  => \cf9 setSearchFocus\cf5 (\cf7 false\cf5 ),\cf11  \cf7 100\cf5 )\}\cf11 \
                \cf12 placeholder\cf11 =\cf5 \{\cf11 mainTab \cf4 ===\cf11  \cf6 "items"\cf11  \cf4 ?\cf11  \cf6 "\uc0\u47932 \u44148 , \u44277 \u50672 \u47749  \u44160 \u49353 "\cf11  \cf4 :\cf11  \cf6 "\uc0\u44277 \u44256 , \u48516 \u50556 , \u45800 \u52404  \u44160 \u49353 "\cf5 \}\cf11 \
                \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  outline\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#1a1a1a"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
              \cf5 \{\cf4 searchQuery && \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setSearchQuery\cf5 (\cf6 ""\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#bbb"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 16\cf5 ,\cf11  padding\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\cf4 <i className="ti ti-x" />\cf5 </\cf11 button\cf5 >\}\cf4 \
            \cf5 </\cf11 div\cf5 >\cf4 \
\
            \cf5 \{\cf10 /* Main tab */\cf5 \}\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 0\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\cf4 \
              \cf5 \{[[\cf6 "items"\cf5 ,\cf4  \cf6 "\uc0\u51473 \u44256  \u47932 \u44148 "\cf5 ],\cf4  \cf5 [\cf6 "jobs"\cf5 ,\cf4  \cf6 "\uc0\u51068 \u51088 \u47532 "\cf5 ]].\cf9 map\cf5 (([\cf4 t\cf5 ,\cf4  l\cf5 ])\cf4  => \cf5 (\cf4 \
                \cf5 <\cf11 button \cf12 key\cf11 =\cf5 \{\cf11 t\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setMainTab\cf5 (\cf11 t\cf5 );\cf11  \cf9 setSearchQuery\cf5 (\cf6 ""\cf5 );\cf11  \cf9 setActiveCat\cf5 (\cf6 "\uc0\u51204 \u52404 "\cf5 );\cf11  \cf9 setActiveField\cf5 (\cf6 "\uc0\u51204 \u52404 "\cf5 );\cf11  \cf9 setActiveType\cf5 (\cf6 "\uc0\u51204 \u52404 "\cf5 );\cf11  \cf5 \}\}\cf11 \
                  \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "8px 0"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  fontWeight\cf4 :\cf11  mainTab \cf4 ===\cf11  t \cf4 ?\cf11  \cf7 500\cf11  \cf4 :\cf11  \cf7 400\cf5 ,\cf11  color\cf4 :\cf11  mainTab \cf4 ===\cf11  t \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#aaa"\cf5 ,\cf11  borderBottom\cf4 :\cf11  mainTab \cf4 ===\cf11  t \cf4 ?\cf11  \cf6 `2px solid $\{ACCENT\}`\cf11  \cf4 :\cf11  \cf6 "2px solid transparent"\cf11  \cf5 \}\}>\cf4 \
                  \cf5 \{\cf4 l\cf5 \}\cf4 \
                \cf5 </\cf11 button\cf5 >\cf4 \
              \cf5 ))\}\cf4 \
            \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
\
          \cf5 \{\cf10 /* Filters */\cf5 \}\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "8px 16px 8px"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f5f5f5"\cf5 ,\cf11  overflowX\cf4 :\cf11  \cf6 "auto"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 6\cf11  \cf5 \}\}>\cf4 \
            \cf5 \{\cf4 mainTab === \cf6 "items"\cf4 \
              ? \cf7 ITEM_CATS\cf5 .\cf9 map\cf5 (\cf4 c => \cf9 filterChip\cf5 (\cf4 c\cf5 ,\cf4  activeCat === c\cf5 ,\cf4  \cf5 ()\cf4  => \cf9 setActiveCat\cf5 (\cf4 c\cf5 )))\cf4 \
              : \cf5 <>\cf4 \
                  \cf5 \{\cf7 JOB_FIELDS\cf5 .\cf9 map\cf5 (\cf4 f => \cf9 filterChip\cf5 (\cf4 f\cf5 ,\cf4  activeField === f\cf5 ,\cf4  \cf5 ()\cf4  => \cf9 setActiveField\cf5 (\cf4 f\cf5 )))\}\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 1\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#e0e0e0"\cf5 ,\cf11  flexShrink\cf4 :\cf11  \cf7 0\cf5 ,\cf11  margin\cf4 :\cf11  \cf6 "4px 4px"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                  \cf5 \{\cf7 JOB_TYPES\cf5 .\cf9 map\cf5 (\cf4 t => \cf9 filterChip\cf5 (\cf4 t\cf5 ,\cf4  activeType === t\cf5 ,\cf4  \cf5 ()\cf4  => \cf9 setActiveType\cf5 (\cf4 t\cf5 )))\}\cf4 \
                \cf5 </>\cf4 \
            \cf5 \}\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
\
          \cf5 \{\cf10 /* List */\cf5 \}\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  overflowY\cf4 :\cf11  \cf6 "auto"\cf5 ,\cf11  paddingBottom\cf4 :\cf11  \cf7 80\cf11  \cf5 \}\}>\cf4 \
            \cf5 \{\cf4 searchQuery && \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "8px 16px 0"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#999"\cf11  \cf5 \}\}>\cf4 \
                \uc0\u44160 \u49353  \u44208 \u44284  \cf5 \{\cf4 allResults\cf5 .\cf4 length\cf5 \}\cf4 \uc0\u44148 \
              \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 )\}\cf4 \
\
            \cf5 \{\cf4 mainTab === \cf6 "items"\cf4  && filteredItems\cf5 .\cf9 map\cf5 (\cf4 item => \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 item\cf5 .\cf11 id\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setSelectedItem\cf5 (\cf11 item\cf5 );\cf11  \cf9 setScreen\cf5 (\cf6 "detail"\cf5 );\cf11  \cf5 \}\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 12\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "14px 16px"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f5f5f5"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 80\cf5 ,\cf11  height\cf4 :\cf11  \cf7 80\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT_LIGHT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 30\cf5 ,\cf11  flexShrink\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\{\cf4 item\cf5 .\cf4 image\cf5 \}</\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  minWidth\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "space-between"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "flex-start"\cf11  \cf5 \}\}>\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#1a1a1a"\cf5 ,\cf11  lineHeight\cf4 :\cf11  \cf7 1.3\cf11  \cf5 \}\}>\{\cf4 item\cf5 .\cf4 title\cf5 \}</\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{\cf11 e => \cf9 toggleLike\cf5 (\cf11 item\cf5 .\cf11 id\cf5 ,\cf11  e\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  padding\cf4 :\cf11  \cf7 0\cf5 ,\cf11  marginLeft\cf4 :\cf11  \cf7 8\cf11  \cf5 \}\}>\cf4 \
                      \cf5 <\cf11 i \cf12 className\cf11 =\cf5 \{\cf6 `ti ti-heart`\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 18\cf5 ,\cf11  color\cf4 :\cf11  likes\cf5 [\cf11 item\cf5 .\cf11 id\cf5 ]\cf11  \cf4 ?\cf11  \cf6 "#e25"\cf11  \cf4 :\cf11  \cf6 "#ddd"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                    \cf5 </\cf11 button\cf5 >\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#999"\cf5 ,\cf11  margin\cf4 :\cf11  \cf6 "3px 0"\cf11  \cf5 \}\}>\{\cf4 item\cf5 .\cf4 show\cf5 \}</\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "space-between"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 6\cf11  \cf5 \}\}>\cf4 \
                    \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  color\cf4 :\cf11  item\cf5 .\cf11 price \cf4 ===\cf11  \cf7 0\cf11  \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#1a1a1a"\cf11  \cf5 \}\}>\{\cf4 item\cf5 .\cf4 price === \cf7 0\cf4  ? \cf6 "\uc0\u47924 \u47308  \u45208 \u45588 "\cf4  : \cf6 `\cf5 $\{\cf6 item\cf5 .\cf6 price\cf5 .\cf9 toLocaleString\cf5 ()\}\cf6 \uc0\u50896 `\cf5 \}</\cf11 span\cf5 >\cf4 \
                    \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 10\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#bbb"\cf11  \cf5 \}\}>\cf4 <i className="ti ti-heart" style=\cf5 \{\{\cf4  fontSize: \cf7 12\cf5 ,\cf4  verticalAlign: -\cf7 1\cf5 ,\cf4  marginRight: \cf7 2\cf4  \cf5 \}\}\cf4  />\cf5 \{\cf4 item\cf5 .\cf4 likes + \cf5 (\cf4 likes\cf5 [\cf4 item\cf5 .\cf4 id\cf5 ]\cf4  ? \cf7 1\cf4  : \cf7 0\cf5 )\}</\cf11 span\cf5 >\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 ))\}\cf4 \
\
            \cf5 \{\cf4 mainTab === \cf6 "jobs"\cf4  && filteredJobs\cf5 .\cf9 map\cf5 (\cf4 job => \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 job\cf5 .\cf11 id\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setSelectedJob\cf5 (\cf11 job\cf5 );\cf11  \cf9 setScreen\cf5 (\cf6 "jobdetail"\cf5 );\cf11  \cf5 \}\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "14px 16px"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f5f5f5"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 10\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "flex-start"\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 44\cf5 ,\cf11  height\cf4 :\cf11  \cf7 44\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT_LIGHT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  flexShrink\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\{\cf4 job\cf5 .\cf4 icon\cf5 \}</\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  minWidth\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 6\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 3\cf11  \cf5 \}\}>\cf4 \
                      \cf5 \{\cf9 typeBadge\cf5 (\cf4 job\cf5 .\cf4 type\cf5 )\}\cf4 \
                      \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#bbb"\cf11  \cf5 \}\}>\{\cf4 job\cf5 .\cf4 field\cf5 \}</\cf11 span\cf5 >\cf4 \
                    \cf5 </\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#1a1a1a"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 2\cf11  \cf5 \}\}>\{\cf4 job\cf5 .\cf4 title\cf5 \}</\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#888"\cf11  \cf5 \}\}>\{\cf4 job\cf5 .\cf4 org\cf5 \}\cf4  \'b7 \cf5 \{\cf4 job\cf5 .\cf4 location\cf5 \}</\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "space-between"\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 6\cf11  \cf5 \}\}>\cf4 \
                      \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf7 ACCENT\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 job\cf5 .\cf4 pay\cf5 \}</\cf11 span\cf5 >\cf4 \
                      \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#bbb"\cf11  \cf5 \}\}>\{\cf4 job\cf5 .\cf4 date\cf5 \}</\cf11 span\cf5 >\cf4 \
                    \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 ))\}\cf4 \
\
            \cf5 \{((\cf4 mainTab === \cf6 "items"\cf4  && filteredItems\cf5 .\cf4 length === \cf7 0\cf5 )\cf4  || \cf5 (\cf4 mainTab === \cf6 "jobs"\cf4  && filteredJobs\cf5 .\cf4 length === \cf7 0\cf5 ))\cf4  && \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  textAlign\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#ccc"\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 60\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\cf4 \uc0\u44160 \u49353  \u44208 \u44284 \u44032  \u50630 \u49845 \u45768 \u45796 \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 )\}\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
        \cf5 </\cf11 div\cf5 >\cf4 \
      \cf5 )\}\cf4 \
\
      \cf5 \{\cf10 /* ITEM DETAIL */\cf5 \}\cf4 \
      \cf5 \{\cf4 screen === \cf6 "detail"\cf4  && selectedItem && \cf5 (\cf4 \
        \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "16px"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setScreen\cf5 (\cf6 "home"\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#555"\cf11  \cf5 \}\}>\cf4 <i className="ti ti-arrow-left" />\cf5 </\cf11 button\cf5 >\cf4 \
            \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 15\cf11  \cf5 \}\}>\cf4 \uc0\u47932 \u44148  \u49345 \u49464 \cf5 </\cf11 span\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  overflowY\cf4 :\cf11  \cf6 "auto"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  height\cf4 :\cf11  \cf7 220\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT_LIGHT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 72\cf11  \cf5 \}\}>\{\cf4 selectedItem\cf5 .\cf4 image\cf5 \}</\cf11 div\cf5 >\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf7 16\cf11  \cf5 \}\}>\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "space-between"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "flex-start"\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 div\cf5 >\cf4 <div style=\cf5 \{\{\cf4  fontSize: \cf7 18\cf5 ,\cf4  fontWeight: \cf7 500\cf4  \cf5 \}\}\cf4 >\cf5 \{\cf4 selectedItem\cf5 .\cf4 title\cf5 \}</\cf11 div\cf5 >\cf4 <div style=\cf5 \{\{\cf4  fontSize: \cf7 12\cf5 ,\cf4  color: \cf6 "#999"\cf5 ,\cf4  marginTop: \cf7 3\cf4  \cf5 \}\}\cf4 >\cf5 \{\cf4 selectedItem\cf5 .\cf4 category\cf5 \}\cf4  \'b7 \cf5 \{\cf4 selectedItem\cf5 .\cf4 show\cf5 \}</\cf11 div\cf5 ></\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 16\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  color\cf4 :\cf11  selectedItem\cf5 .\cf11 price \cf4 ===\cf11  \cf7 0\cf11  \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#1a1a1a"\cf11  \cf5 \}\}>\{\cf4 selectedItem\cf5 .\cf4 price === \cf7 0\cf4  ? \cf6 "\uc0\u47924 \u47308  \u45208 \u45588 "\cf4  : \cf6 `\cf5 $\{\cf6 selectedItem\cf5 .\cf6 price\cf5 .\cf9 toLocaleString\cf5 ()\}\cf6 \uc0\u50896 `\cf5 \}</\cf11 span\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginTop\cf4 :\cf11  \cf7 16\cf5 ,\cf11  padding\cf4 :\cf11  \cf7 14\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#fafafa"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 p \cf12 style\cf11 =\cf5 \{\{\cf11  margin\cf4 :\cf11  \cf7 0\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  lineHeight\cf4 :\cf11  \cf7 1.7\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#333"\cf11  \cf5 \}\}>\{\cf4 selectedItem\cf5 .\cf4 desc\cf5 \}</\cf11 p\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginTop\cf4 :\cf11  \cf7 16\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 10\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "12px 14px"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 36\cf5 ,\cf11  height\cf4 :\cf11  \cf7 36\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf6 "50%"\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\{\cf4 selectedItem\cf5 .\cf4 sellerInitial\cf5 \}</\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div\cf5 >\cf4 <div style=\cf5 \{\{\cf4  fontSize: \cf7 13\cf5 ,\cf4  fontWeight: \cf7 500\cf4  \cf5 \}\}\cf4 >\cf5 \{\cf4 selectedItem\cf5 .\cf4 seller\cf5 \}</\cf11 div\cf5 >\cf4 <div style=\cf5 \{\{\cf4  fontSize: \cf7 11\cf5 ,\cf4  color: \cf6 "#aaa"\cf4  \cf5 \}\}\cf4 >\uc0\u54032 \u47588 \u51088 \cf5 </\cf11 div\cf5 ></\cf11 div\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "12px 16px"\cf5 ,\cf11  borderTop\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 toggleLike\cf5 (\cf11 selectedItem\cf5 .\cf11 id\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 44\cf5 ,\cf11  height\cf4 :\cf11  \cf7 44\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  border\cf4 :\cf11  \cf6 `0.5px solid $\{likes[selectedItem.id] ? "#e25" : "#e0e0e0"\}`\cf5 ,\cf11  background\cf4 :\cf11  likes\cf5 [\cf11 selectedItem\cf5 .\cf11 id\cf5 ]\cf11  \cf4 ?\cf11  \cf6 "#fff0f2"\cf11  \cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 20\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf11  \cf5 \}\}>\cf4 \
              \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-heart\cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  color\cf4 :\cf11  likes\cf5 [\cf11 selectedItem\cf5 .\cf11 id\cf5 ]\cf11  \cf4 ?\cf11  \cf6 "#e25"\cf11  \cf4 :\cf11  \cf6 "#bbb"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
            \cf5 </\cf11 button\cf5 >\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 openChat\cf5 (\cf11 selectedItem\cf5 .\cf11 id\cf5 ,\cf11  selectedItem\cf5 .\cf11 title\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  height\cf4 :\cf11  \cf7 44\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\cf4 \uc0\u52292 \u54021 \u51004 \u47196  \u47928 \u51032 \u54616 \u44592 \cf5 </\cf11 button\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
        \cf5 </\cf11 div\cf5 >\cf4 \
      \cf5 )\}\cf4 \
\
      \cf5 \{\cf10 /* JOB DETAIL */\cf5 \}\cf4 \
      \cf5 \{\cf4 screen === \cf6 "jobdetail"\cf4  && selectedJob && \cf5 (\cf4 \
        \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "16px"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setScreen\cf5 (\cf6 "home"\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#555"\cf11  \cf5 \}\}>\cf4 <i className="ti ti-arrow-left" />\cf5 </\cf11 button\cf5 >\cf4 \
            \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 15\cf11  \cf5 \}\}>\cf4 \uc0\u44277 \u44256  \u49345 \u49464 \cf5 </\cf11 span\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  overflowY\cf4 :\cf11  \cf6 "auto"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf7 16\cf11  \cf5 \}\}>\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 12\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 52\cf5 ,\cf11  height\cf4 :\cf11  \cf7 52\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 14\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT_LIGHT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 28\cf11  \cf5 \}\}>\{\cf4 selectedJob\cf5 .\cf4 icon\cf5 \}</\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 6\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 4\cf11  \cf5 \}\}>\{\cf9 typeBadge\cf5 (\cf4 selectedJob\cf5 .\cf4 type\cf5 )\}<\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#aaa"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#f5f5f5"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "2px 8px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf11  \cf5 \}\}>\{\cf4 selectedJob\cf5 .\cf4 field\cf5 \}</\cf11 span\cf5 ></\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 17\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 selectedJob\cf5 .\cf4 title\cf5 \}</\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 \{[[\cf6 "\uc0\u45800 \u52404 "\cf5 ,\cf4  selectedJob\cf5 .\cf4 org\cf5 ],\cf4  \cf5 [\cf6 "\uc0\u51648 \u50669 "\cf5 ,\cf4  selectedJob\cf5 .\cf4 location\cf5 ],\cf4  \cf5 [\cf6 "\uc0\u44592 \u44036 "\cf5 ,\cf4  selectedJob\cf5 .\cf4 date\cf5 ],\cf4  \cf5 [\cf6 "\uc0\u48372 \u49688 "\cf5 ,\cf4  selectedJob\cf5 .\cf4 pay\cf5 ]].\cf9 map\cf5 (([\cf4 k\cf5 ,\cf4  v\cf5 ])\cf4  => \cf5 (\cf4 \
                \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 k\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 0"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f5f5f5"\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#aaa"\cf5 ,\cf11  width\cf4 :\cf11  \cf7 48\cf11  \cf5 \}\}>\{\cf4 k\cf5 \}</\cf11 span\cf5 >\cf4 \
                  \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#1a1a1a"\cf5 ,\cf11  fontWeight\cf4 :\cf11  k \cf4 ===\cf11  \cf6 "\uc0\u48372 \u49688 "\cf11  \cf4 ?\cf11  \cf7 500\cf11  \cf4 :\cf11  \cf7 400\cf5 ,\cf11  color\cf4 :\cf11  k \cf4 ===\cf11  \cf6 "\uc0\u48372 \u49688 "\cf11  \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#1a1a1a"\cf11  \cf5 \}\}>\{\cf4 v\cf5 \}</\cf11 span\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 ))\}\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginTop\cf4 :\cf11  \cf7 16\cf5 ,\cf11  padding\cf4 :\cf11  \cf7 14\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#fafafa"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 p \cf12 style\cf11 =\cf5 \{\{\cf11  margin\cf4 :\cf11  \cf7 0\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  lineHeight\cf4 :\cf11  \cf7 1.7\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#333"\cf11  \cf5 \}\}>\{\cf4 selectedJob\cf5 .\cf4 desc\cf5 \}</\cf11 p\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "12px 16px"\cf5 ,\cf11  borderTop\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 openChat\cf5 (\cf11 selectedJob\cf5 .\cf11 id\cf5 ,\cf11  selectedJob\cf5 .\cf11 title\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 44\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\cf4 \uc0\u51648 \u50896  / \u47928 \u51032  \u52292 \u54021 \cf5 </\cf11 button\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
        \cf5 </\cf11 div\cf5 >\cf4 \
      \cf5 )\}\cf4 \
\
      \cf5 \{\cf10 /* POST */\cf5 \}\cf4 \
      \cf5 \{\cf4 screen === \cf6 "post"\cf4  && \cf5 (\cf4 \
        \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "16px"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setScreen\cf5 (\cf6 "home"\cf5 );\cf11  \cf9 setBottomTab\cf5 (\cf6 "home"\cf5 );\cf11  \cf5 \}\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#555"\cf11  \cf5 \}\}>\cf4 <i className="ti ti-x" />\cf5 </\cf11 button\cf5 >\cf4 \
            \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 15\cf11  \cf5 \}\}>\cf4 \uc0\u50732 \u47532 \u44592 \cf5 </\cf11 span\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 \{[[\cf6 "item"\cf5 ,\cf4  \cf6 "\uc0\u51473 \u44256  \u47932 \u44148 "\cf5 ],\cf4  \cf5 [\cf6 "job"\cf5 ,\cf4  \cf6 "\uc0\u51068 \u51088 \u47532  \u44277 \u44256 "\cf5 ]].\cf9 map\cf5 (([\cf4 t\cf5 ,\cf4  l\cf5 ])\cf4  => \cf5 (\cf4 \
              \cf5 <\cf11 button \cf12 key\cf11 =\cf5 \{\cf11 t\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setPostMode\cf5 (\cf11 t\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 0"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  fontWeight\cf4 :\cf11  postMode \cf4 ===\cf11  t \cf4 ?\cf11  \cf7 500\cf11  \cf4 :\cf11  \cf7 400\cf5 ,\cf11  color\cf4 :\cf11  postMode \cf4 ===\cf11  t \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#aaa"\cf5 ,\cf11  borderBottom\cf4 :\cf11  postMode \cf4 ===\cf11  t \cf4 ?\cf11  \cf6 `2px solid $\{ACCENT\}`\cf11  \cf4 :\cf11  \cf6 "2px solid transparent"\cf11  \cf5 \}\}>\{\cf4 l\cf5 \}</\cf11 button\cf5 >\cf4 \
            \cf5 ))\}\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  overflowY\cf4 :\cf11  \cf6 "auto"\cf5 ,\cf11  padding\cf4 :\cf11  \cf7 16\cf11  \cf5 \}\}>\cf4 \
            \cf5 \{\cf4 postMode === \cf6 "item"\cf4  ? \cf5 (\cf4 \
              \cf5 <>\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  height\cf4 :\cf11  \cf7 100\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT_LIGHT\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  border\cf4 :\cf11  \cf6 `1.5px dashed $\{ACCENT_MID\}`\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 18\cf5 ,\cf11  color\cf4 :\cf11  \cf7 ACCENT\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-camera\cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 26\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 4\cf11  \cf5 \}\}>\cf4 \uc0\u49324 \u51652  \u52628 \u44032 \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 \{[\{\cf4  label: \cf6 "\uc0\u51228 \u47785 "\cf5 ,\cf4  key: \cf6 "title"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : \u48744 \u44036  \u46300 \u47112 \u49828  2\u48268 "\cf4  \cf5 \},\cf4  \cf5 \{\cf4  label: \cf6 "\uc0\u44277 \u50672 /\u51204 \u49884 \u47749 "\cf5 ,\cf4  key: \cf6 "show"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : \u45804 \u48731  \u49548 \u45208 \u53440  2024"\cf4  \cf5 \},\cf4  \cf5 \{\cf4  label: \cf6 "\uc0\u44032 \u44201  (0\u51060 \u47732  \u47924 \u47308  \u45208 \u45588 )"\cf5 ,\cf4  key: \cf6 "price"\cf5 ,\cf4  ph: \cf6 "0"\cf5 ,\cf4  type: \cf6 "number"\cf4  \cf5 \}].\cf9 map\cf5 (\cf4 f => \cf5 (\cf4 \
                  \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 f\cf5 .\cf11 key\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 f\cf5 .\cf4 label\cf5 \}</\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 input \cf12 value\cf11 =\cf5 \{\cf11 form\cf5 [\cf11 f\cf5 .\cf11 key\cf5 ]\}\cf11  \cf12 onChange\cf11 =\cf5 \{\cf11 e => \cf9 setForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  \cf5 [\cf11 f\cf5 .\cf11 key\cf5 ]\cf4 :\cf11  e\cf5 .\cf11 target\cf5 .\cf11 value \cf5 \}))\}\cf11  \cf12 placeholder\cf11 =\cf5 \{\cf11 f\cf5 .\cf11 ph\cf5 \}\cf11  \cf12 type\cf11 =\cf5 \{\cf11 f\cf5 .\cf11 type \cf4 ||\cf11  \cf6 "text"\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid #e0e0e0"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 12px"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  boxSizing\cf4 :\cf11  \cf6 "border-box"\cf5 ,\cf11  outline\cf4 :\cf11  \cf6 "none"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 ))\}\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\cf4 \uc0\u49444 \u47749 \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 textarea \cf12 value\cf11 =\cf5 \{\cf11 form\cf5 .\cf11 desc\cf5 \}\cf11  \cf12 onChange\cf11 =\cf5 \{\cf11 e => \cf9 setForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  desc\cf4 :\cf11  e\cf5 .\cf11 target\cf5 .\cf11 value \cf5 \}))\}\cf11  \cf12 placeholder\cf5 ="\cf6 \uc0\u49345 \u53468 , \u54589 \u50629  \u48169 \u48277  \u46321 \cf5 "\cf11  \cf12 rows\cf11 =\cf5 \{\cf7 3\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid #e0e0e0"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 12px"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  resize\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  boxSizing\cf4 :\cf11  \cf6 "border-box"\cf5 ,\cf11  outline\cf4 :\cf11  \cf6 "none"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 18\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\cf4 \uc0\u52852 \u53580 \u44256 \u47532 \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 6\cf5 ,\cf11  flexWrap\cf4 :\cf11  \cf6 "wrap"\cf11  \cf5 \}\}>\cf4 \
                    \cf5 \{[\cf6 "\uc0\u51032 \u49345 "\cf5 ,\cf4  \cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  \cf6 "\uc0\u49464 \u53944 "\cf5 ,\cf4  \cf6 "\uc0\u49548 \u54408 "\cf5 ,\cf4  \cf6 "\uc0\u44592 \u53440 "\cf5 ].\cf9 map\cf5 (\cf4 c => \cf5 (\cf4 \
                      \cf5 <\cf11 button \cf12 key\cf11 =\cf5 \{\cf11 c\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  category\cf4 :\cf11  c \cf5 \}))\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "5px 12px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 20\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid"\cf5 ,\cf11  borderColor\cf4 :\cf11  form\cf5 .\cf11 category \cf4 ===\cf11  c \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#e0e0e0"\cf5 ,\cf11  background\cf4 :\cf11  form\cf5 .\cf11 category \cf4 ===\cf11  c \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  color\cf4 :\cf11  form\cf5 .\cf11 category \cf4 ===\cf11  c \cf4 ?\cf11  \cf6 "#fff"\cf11  \cf4 :\cf11  \cf6 "#555"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\{\cf4 c\cf5 \}</\cf11 button\cf5 >\cf4 \
                    \cf5 ))\}\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{\cf11 submitItem\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 46\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  form\cf5 .\cf11 title \cf4 &&\cf11  form\cf5 .\cf11 show \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#ddd"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 15\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 80\cf11  \cf5 \}\}>\cf4 \uc0\u50732 \u47532 \u44592 \cf5 </\cf11 button\cf5 >\cf4 \
              \cf5 </>\cf4 \
            \cf5 )\cf4  : \cf5 (\cf4 \
              \cf5 <>\cf4 \
                \cf5 \{[\{\cf4  label: \cf6 "\uc0\u44277 \u44256  \u51228 \u47785 "\cf5 ,\cf4  key: \cf6 "title"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : \u51312 \u47749  \u46356 \u51088 \u51060 \u45320  \u44396 \u54633 \u45768 \u45796 "\cf4  \cf5 \},\cf4  \cf5 \{\cf4  label: \cf6 "\uc0\u45800 \u52404 /\u44592 \u44288 \u47749 "\cf5 ,\cf4  key: \cf6 "org"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : \u44537 \u45800  \u54028 \u46020 "\cf4  \cf5 \},\cf4  \cf5 \{\cf4  label: \cf6 "\uc0\u51648 \u50669 "\cf5 ,\cf4  key: \cf6 "location"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : \u45824 \u54617 \u47196 "\cf4  \cf5 \},\cf4  \cf5 \{\cf4  label: \cf6 "\uc0\u44592 \u44036 "\cf5 ,\cf4  key: \cf6 "date"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : 2025.07.01~07.10"\cf4  \cf5 \},\cf4  \cf5 \{\cf4  label: \cf6 "\uc0\u48372 \u49688 "\cf5 ,\cf4  key: \cf6 "pay"\cf5 ,\cf4  ph: \cf6 "\uc0\u50696 : \u54801 \u51032  / \u51068  80,000\u50896 "\cf4  \cf5 \}].\cf9 map\cf5 (\cf4 f => \cf5 (\cf4 \
                  \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 f\cf5 .\cf11 key\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 f\cf5 .\cf4 label\cf5 \}</\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 input \cf12 value\cf11 =\cf5 \{\cf11 jobForm\cf5 [\cf11 f\cf5 .\cf11 key\cf5 ]\cf11  \cf4 ||\cf11  \cf6 ""\cf5 \}\cf11  \cf12 onChange\cf11 =\cf5 \{\cf11 e => \cf9 setJobForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  \cf5 [\cf11 f\cf5 .\cf11 key\cf5 ]\cf4 :\cf11  e\cf5 .\cf11 target\cf5 .\cf11 value \cf5 \}))\}\cf11  \cf12 placeholder\cf11 =\cf5 \{\cf11 f\cf5 .\cf11 ph\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid #e0e0e0"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 12px"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  boxSizing\cf4 :\cf11  \cf6 "border-box"\cf5 ,\cf11  outline\cf4 :\cf11  \cf6 "none"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 ))\}\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\cf4 \uc0\u44277 \u44256  \u45236 \u50857 \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 textarea \cf12 value\cf11 =\cf5 \{\cf11 jobForm\cf5 .\cf11 desc\cf5 \}\cf11  \cf12 onChange\cf11 =\cf5 \{\cf11 e => \cf9 setJobForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  desc\cf4 :\cf11  e\cf5 .\cf11 target\cf5 .\cf11 value \cf5 \}))\}\cf11  \cf12 placeholder\cf5 ="\cf6 \uc0\u47784 \u51665  \u51312 \u44148 , \u45812 \u45817  \u50629 \u47924  \u46321 \cf5 "\cf11  \cf12 rows\cf11 =\cf5 \{\cf7 3\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 10\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid #e0e0e0"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 12px"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  resize\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  boxSizing\cf4 :\cf11  \cf6 "border-box"\cf5 ,\cf11  outline\cf4 :\cf11  \cf6 "none"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 14\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\cf4 \uc0\u48516 \u50556 \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 6\cf5 ,\cf11  flexWrap\cf4 :\cf11  \cf6 "wrap"\cf11  \cf5 \}\}>\cf4 \
                    \cf5 \{[\cf6 "\uc0\u51312 \u47749 "\cf5 ,\cf4  \cf6 "\uc0\u47924 \u45824 "\cf5 ,\cf4  \cf6 "\uc0\u51020 \u54693 "\cf5 ,\cf4  \cf6 "\uc0\u48516 \u51109 "\cf5 ,\cf4  \cf6 "\uc0\u50689 \u49345 "\cf5 ,\cf4  \cf6 "\uc0\u44592 \u53440 "\cf5 ].\cf9 map\cf5 (\cf4 f => \cf5 (\cf4 \
                      \cf5 <\cf11 button \cf12 key\cf11 =\cf5 \{\cf11 f\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setJobForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  field\cf4 :\cf11  f \cf5 \}))\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "5px 12px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 20\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid"\cf5 ,\cf11  borderColor\cf4 :\cf11  jobForm\cf5 .\cf11 field \cf4 ===\cf11  f \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#e0e0e0"\cf5 ,\cf11  background\cf4 :\cf11  jobForm\cf5 .\cf11 field \cf4 ===\cf11  f \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  color\cf4 :\cf11  jobForm\cf5 .\cf11 field \cf4 ===\cf11  f \cf4 ?\cf11  \cf6 "#fff"\cf11  \cf4 :\cf11  \cf6 "#555"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\{\cf4 f\cf5 \}</\cf11 button\cf5 >\cf4 \
                    \cf5 ))\}\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  marginBottom\cf4 :\cf11  \cf7 18\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#666"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 5\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\cf4 \uc0\u44256 \u50857  \u54805 \u53468 \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 6\cf11  \cf5 \}\}>\cf4 \
                    \cf5 \{[\cf6 "\uc0\u45800 \u44592 "\cf5 ,\cf4  \cf6 "\uc0\u51109 \u44592 "\cf5 ].\cf9 map\cf5 (\cf4 t => \cf5 (\cf4 \
                      \cf5 <\cf11 button \cf12 key\cf11 =\cf5 \{\cf11 t\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setJobForm\cf5 (\cf11 p => \cf5 (\{\cf11  ...p\cf5 ,\cf11  type\cf4 :\cf11  t \cf5 \}))\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "5px 16px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 20\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid"\cf5 ,\cf11  borderColor\cf4 :\cf11  jobForm\cf5 .\cf11 type \cf4 ===\cf11  t \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#e0e0e0"\cf5 ,\cf11  background\cf4 :\cf11  jobForm\cf5 .\cf11 type \cf4 ===\cf11  t \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  color\cf4 :\cf11  jobForm\cf5 .\cf11 type \cf4 ===\cf11  t \cf4 ?\cf11  \cf6 "#fff"\cf11  \cf4 :\cf11  \cf6 "#555"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf11  \cf5 \}\}>\{\cf4 t\cf5 \}</\cf11 button\cf5 >\cf4 \
                    \cf5 ))\}\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{\cf11 submitJob\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf6 "100%"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 46\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  jobForm\cf5 .\cf11 title \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#ddd"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 15\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  marginBottom\cf4 :\cf11  \cf7 80\cf11  \cf5 \}\}>\cf4 \uc0\u44277 \u44256  \u50732 \u47532 \u44592 \cf5 </\cf11 button\cf5 >\cf4 \
              \cf5 </>\cf4 \
            \cf5 )\}\cf4 \
            \cf5 \{\cf4 showPosted && \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  position\cf4 :\cf11  \cf6 "absolute"\cf5 ,\cf11  top\cf4 :\cf11  \cf6 "50%"\cf5 ,\cf11  left\cf4 :\cf11  \cf6 "50%"\cf5 ,\cf11  transform\cf4 :\cf11  \cf6 "translate(-50%,-50%)"\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "rgba(45,106,79,0.95)"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "12px 24px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 14\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 14\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf5 ,\cf11  zIndex\cf4 :\cf11  \cf7 100\cf11  \cf5 \}\}>\cf4 \uc0\u10003  \u46321 \u47197  \u50756 \u47308 !\cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 )\}\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
        \cf5 </\cf11 div\cf5 >\cf4 \
      \cf5 )\}\cf4 \
\
      \cf5 \{\cf10 /* CHAT LIST */\cf5 \}\cf4 \
      \cf5 \{\cf4 screen === \cf6 "chatlist"\cf4  && \cf5 (\cf4 \
        \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "20px 16px 14px"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 18\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\cf4 \uc0\u52292 \u54021 \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  overflowY\cf4 :\cf11  \cf6 "auto"\cf5 ,\cf11  paddingBottom\cf4 :\cf11  \cf7 80\cf11  \cf5 \}\}>\cf4 \
            \cf5 \{\cf4 chatList\cf5 .\cf9 map\cf5 ((\{\cf4  id\cf5 ,\cf4  label \cf5 \})\cf4  => \cf5 \{\cf4 \
              \cf2 const\cf4  msgs = chats\cf5 [\cf4 id\cf5 ]\cf4  || \cf5 [];\cf4 \
              \cf2 const\cf4  last = msgs\cf5 [\cf4 msgs\cf5 .\cf4 length - \cf7 1\cf5 ];\cf4 \
              \cf2 return\cf4  \cf5 (\cf4 \
                \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 id\cf5 \}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 openChat\cf5 (\cf11 id\cf5 ,\cf11  label\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 12\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "14px 16px"\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f5f5f5"\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf11  \cf5 \}\}>\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 46\cf5 ,\cf11  height\cf4 :\cf11  \cf7 46\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 12\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT_LIGHT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 20\cf11  \cf5 \}\}>\cf4 \
                    \cf5 \{\cf4 id >= \cf7 100\cf4  ? \cf6 "\uc0\u55357 \u56508 "\cf4  : \cf6 "\uc0\u55357 \u56550 "\cf5 \}\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                  \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  minWidth\cf4 :\cf11  \cf7 0\cf11  \cf5 \}\}>\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "space-between"\cf11  \cf5 \}\}>\cf4 \
                      \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 label\cf5 \}</\cf11 div\cf5 >\cf4 \
                      \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#bbb"\cf11  \cf5 \}\}>\cf4 \uc0\u48169 \u44552  \u51204 \cf5 </\cf11 div\cf5 >\cf4 \
                    \cf5 </\cf11 div\cf5 >\cf4 \
                    \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 12\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#999"\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 2\cf5 ,\cf11  whiteSpace\cf4 :\cf11  \cf6 "nowrap"\cf5 ,\cf11  overflow\cf4 :\cf11  \cf6 "hidden"\cf5 ,\cf11  textOverflow\cf4 :\cf11  \cf6 "ellipsis"\cf11  \cf5 \}\}>\{\cf4 last ? last\cf5 .\cf4 text : \cf6 "\uc0\u49352  \u52292 \u54021 "\cf5 \}</\cf11 div\cf5 >\cf4 \
                  \cf5 </\cf11 div\cf5 >\cf4 \
                \cf5 </\cf11 div\cf5 >\cf4 \
              \cf5 );\cf4 \
            \cf5 \})\}\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
        \cf5 </\cf11 div\cf5 >\cf4 \
      \cf5 )\}\cf4 \
\
      \cf5 \{\cf10 /* CHAT */\cf5 \}\cf4 \
      \cf5 \{\cf4 screen === \cf6 "chat"\cf4  && \cf5 (\cf4 \
        \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  height\cf4 :\cf11  \cf7 700\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "14px 16px"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf5 ,\cf11  borderBottom\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf9 setScreen\cf5 (\cf6 "chatlist"\cf5 )\}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  background\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#555"\cf11  \cf5 \}\}>\cf4 <i className="ti ti-arrow-left" />\cf5 </\cf11 button\cf5 >\cf4 \
            \cf5 <\cf11 div\cf5 >\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  fontWeight\cf4 :\cf11  \cf7 500\cf11  \cf5 \}\}>\{\cf4 activeChatLabel\cf5 \}</\cf11 div\cf5 >\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 11\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#aaa"\cf11  \cf5 \}\}>\cf4 \uc0\u52292 \u54021 \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  overflowY\cf4 :\cf11  \cf6 "auto"\cf5 ,\cf11  padding\cf4 :\cf11  \cf7 16\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  flexDirection\cf4 :\cf11  \cf6 "column"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 10\cf11  \cf5 \}\}>\cf4 \
            \cf5 \{(\cf4 chats\cf5 [\cf4 activeChat\cf5 ]\cf4  || \cf5 []).\cf9 map\cf5 ((\cf4 msg\cf5 ,\cf4  i\cf5 )\cf4  => \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 key\cf11 =\cf5 \{\cf11 i\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  justifyContent\cf4 :\cf11  msg\cf5 .\cf2 from\cf11  \cf4 ===\cf11  \cf6 "me"\cf11  \cf4 ?\cf11  \cf6 "flex-end"\cf11  \cf4 :\cf11  \cf6 "flex-start"\cf11  \cf5 \}\}>\cf4 \
                \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  maxWidth\cf4 :\cf11  \cf6 "70%"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "9px 13px"\cf5 ,\cf11  borderRadius\cf4 :\cf11  msg\cf5 .\cf2 from\cf11  \cf4 ===\cf11  \cf6 "me"\cf11  \cf4 ?\cf11  \cf6 "16px 16px 4px 16px"\cf11  \cf4 :\cf11  \cf6 "16px 16px 16px 4px"\cf5 ,\cf11  background\cf4 :\cf11  msg\cf5 .\cf2 from\cf11  \cf4 ===\cf11  \cf6 "me"\cf11  \cf4 ?\cf11  \cf7 ACCENT\cf11  \cf4 :\cf11  \cf6 "#f3f3f3"\cf5 ,\cf11  color\cf4 :\cf11  msg\cf5 .\cf2 from\cf11  \cf4 ===\cf11  \cf6 "me"\cf11  \cf4 ?\cf11  \cf6 "#fff"\cf11  \cf4 :\cf11  \cf6 "#1a1a1a"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  lineHeight\cf4 :\cf11  \cf7 1.5\cf11  \cf5 \}\}>\{\cf4 msg\cf5 .\cf4 text\cf5 \}</\cf11 div\cf5 >\cf4 \
              \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 ))\}\cf4 \
            \cf5 \{(\cf4 chats\cf5 [\cf4 activeChat\cf5 ]\cf4  || \cf5 []).\cf4 length === \cf7 0\cf4  && \cf5 (\cf4 \
              \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  textAlign\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#ccc"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf7 40\cf11  \cf5 \}\}>\cf4 \uc0\u47700 \u49884 \u51648 \u47484  \u48372 \u45236 \u48372 \u49464 \u50836 \cf5 </\cf11 div\cf5 >\cf4 \
            \cf5 )\}\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  padding\cf4 :\cf11  \cf6 "10px 12px"\cf5 ,\cf11  borderTop\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  gap\cf4 :\cf11  \cf7 8\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 input \cf12 value\cf11 =\cf5 \{\cf11 chatInput\cf5 \}\cf11  \cf12 onChange\cf11 =\cf5 \{\cf11 e => \cf9 setChatInput\cf5 (\cf11 e\cf5 .\cf11 target\cf5 .\cf11 value\cf5 )\}\cf11  \cf12 onKeyDown\cf11 =\cf5 \{\cf11 e => e\cf5 .\cf11 key \cf4 ===\cf11  \cf6 "Enter"\cf11  \cf4 &&\cf11  \cf9 sendMsg\cf5 ()\}\cf11  \cf12 placeholder\cf5 ="\cf6 \uc0\u47700 \u49884 \u51648 \u47484  \u51077 \u47141 \u54616 \u49464 \u50836 \cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  flex\cf4 :\cf11  \cf7 1\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf7 20\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "0.5px solid #e0e0e0"\cf5 ,\cf11  padding\cf4 :\cf11  \cf6 "10px 14px"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 13\cf5 ,\cf11  outline\cf4 :\cf11  \cf6 "none"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
            \cf5 <\cf11 button \cf12 onClick\cf11 =\cf5 \{\cf11 sendMsg\cf5 \}\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 40\cf5 ,\cf11  height\cf4 :\cf11  \cf7 40\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf6 "50%"\cf5 ,\cf11  border\cf4 :\cf11  \cf6 "none"\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  fontSize\cf4 :\cf11  \cf7 18\cf5 ,\cf11  cursor\cf4 :\cf11  \cf6 "pointer"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf11  \cf5 \}\}>\cf4 \
              \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-send\cf5 "\cf11  \cf5 />\cf4 \
            \cf5 </\cf11 button\cf5 >\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
        \cf5 </\cf11 div\cf5 >\cf4 \
      \cf5 )\}\cf4 \
\
      \cf5 \{\cf10 /* BOTTOM NAV */\cf5 \}\cf4 \
      \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  position\cf4 :\cf11  \cf6 "absolute"\cf5 ,\cf11  bottom\cf4 :\cf11  \cf7 0\cf5 ,\cf11  left\cf4 :\cf11  \cf7 0\cf5 ,\cf11  right\cf4 :\cf11  \cf7 0\cf5 ,\cf11  height\cf4 :\cf11  \cf7 64\cf5 ,\cf11  background\cf4 :\cf11  \cf6 "#fff"\cf5 ,\cf11  borderTop\cf4 :\cf11  \cf6 "0.5px solid #f0f0f0"\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  zIndex\cf4 :\cf11  \cf7 50\cf11  \cf5 \}\}>\cf4 \
        \cf5 <\cf11 button \cf12 style\cf11 =\cf5 \{\cf9 tabBtn\cf5 (\cf6 "home"\cf5 )\}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setBottomTab\cf5 (\cf6 "home"\cf5 );\cf11  \cf9 setScreen\cf5 (\cf6 "home"\cf5 );\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-home\cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\cf9 tabIcon\cf5 (\cf6 "home"\cf5 )\}\cf11  \cf12 aria-hidden\cf11  \cf5 />\cf4 \uc0\u54856 \
        \cf5 </\cf11 button\cf5 >\cf4 \
        \cf5 <\cf11 button \cf12 style\cf11 =\cf5 \{\cf9 tabBtn\cf5 (\cf6 "post"\cf5 )\}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setBottomTab\cf5 (\cf6 "post"\cf5 );\cf11  \cf9 setScreen\cf5 (\cf6 "post"\cf5 );\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 div \cf12 style\cf11 =\cf5 \{\{\cf11  width\cf4 :\cf11  \cf7 44\cf5 ,\cf11  height\cf4 :\cf11  \cf7 44\cf5 ,\cf11  borderRadius\cf4 :\cf11  \cf6 "50%"\cf5 ,\cf11  background\cf4 :\cf11  \cf7 ACCENT\cf5 ,\cf11  display\cf4 :\cf11  \cf6 "flex"\cf5 ,\cf11  alignItems\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  justifyContent\cf4 :\cf11  \cf6 "center"\cf5 ,\cf11  marginTop\cf4 :\cf11  \cf4 -\cf7 24\cf11  \cf5 \}\}>\cf4 \
            \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-plus\cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\{\cf11  fontSize\cf4 :\cf11  \cf7 22\cf5 ,\cf11  color\cf4 :\cf11  \cf6 "#fff"\cf11  \cf5 \}\}\cf11  \cf5 />\cf4 \
          \cf5 </\cf11 div\cf5 >\cf4 \
          \cf5 <\cf11 span \cf12 style\cf11 =\cf5 \{\{\cf11  marginTop\cf4 :\cf11  \cf7 2\cf11  \cf5 \}\}>\cf4 \uc0\u50732 \u47532 \u44592 \cf5 </\cf11 span\cf5 >\cf4 \
        \cf5 </\cf11 button\cf5 >\cf4 \
        \cf5 <\cf11 button \cf12 style\cf11 =\cf5 \{\cf9 tabBtn\cf5 (\cf6 "chatlist"\cf5 )\}\cf11  \cf12 onClick\cf11 =\cf5 \{()\cf11  => \cf5 \{\cf11  \cf9 setBottomTab\cf5 (\cf6 "chatlist"\cf5 );\cf11  \cf9 setScreen\cf5 (\cf6 "chatlist"\cf5 );\cf11  \cf5 \}\}>\cf4 \
          \cf5 <\cf11 i \cf12 className\cf5 ="\cf6 ti ti-message-circle\cf5 "\cf11  \cf12 style\cf11 =\cf5 \{\cf9 tabIcon\cf5 (\cf6 "chatlist"\cf5 )\}\cf11  \cf12 aria-hidden\cf11  \cf5 />\cf4 \uc0\u52292 \u54021 \
        \cf5 </\cf11 button\cf5 >\cf4 \
      \cf5 </\cf11 div\cf5 >\cf4 \
    \cf5 </\cf11 div\cf5 >\cf4 \
  \cf5 );\cf4 \
\cf5 \}}