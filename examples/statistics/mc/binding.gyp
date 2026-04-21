{
  "targets": [
    {
      "target_name": "statistics",
      "sources": [
        "statistics.c",
        "statistics_napi.c"
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
