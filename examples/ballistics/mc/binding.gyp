{
  "targets": [
    {
      "target_name": "ballistics",
      "sources": [
        "ballistics.c",
        "ballistics_napi.c"
      ],
      "conditions": [
        [
          "OS!='win'",
          {
            "libraries": [
              "-lm"
            ]
          }
        ]
      ]
    }
  ]
}
